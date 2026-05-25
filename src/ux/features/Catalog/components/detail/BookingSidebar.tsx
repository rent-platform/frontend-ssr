'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  Info,
  MessageCircle,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import type { CatalogUiItem } from '../../types';
import { pluralize } from '@/ux/utils';
import {
  formatCatalogCardHourSecondary,
  formatCatalogCardPrimaryPrice,
  formatDepositAmount,
  formatPrice,
} from '../../utils';
import { RentalCalendar } from './RentalCalendar';
import { useCreateDealRequest } from '@/business/deals';
import { useCreatePayment } from '@/business/payments';
import {
  setBookingDates,
  setBookingDealId,
  setBookingPriceBreakdown,
  setBookingStep,
  showToast,
  startBookingForItem,
  useAppDispatch,
  useAppSelector,
} from '@/business/shared';
import styles from '../../Catalog.module.scss';

type BookingSidebarProps = {
  item: CatalogUiItem;
  isGuest: boolean;
  onAuthRequired?: () => void;
};

export function BookingSidebar({ item, isGuest, onAuthRequired }: BookingSidebarProps) {
  const dispatch = useAppDispatch();
  const booking = useAppSelector((state) => state.booking);
  const { createDealRequest, isCreating: isCreatingDeal } = useCreateDealRequest();
  const { createPayment, isCreating: isCreatingPayment } = useCreatePayment();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const startDate = booking.startDate ? new Date(booking.startDate) : null;
  const endDate = booking.endDate ? new Date(booking.endDate) : null;
  const isSubmittingPayment = isCreatingDeal || isCreatingPayment;

  const primaryPrice = formatCatalogCardPrimaryPrice(item);
  const hourPrice = formatCatalogCardHourSecondary(item);
  const depositAmount = Number(String(item.depositAmount ?? '0').replace(/\s/g, ''));
  const depositLabel = depositAmount > 0 ? formatDepositAmount(item.depositAmount) : null;

  const dailyPrice = Number(String(item.pricePerDay ?? '0').replace(/\s/g, ''));
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);
  const subtotal = dailyPrice * (rentalDays || 1);

  useEffect(() => {
    if (booking.itemId !== item.id) {
      dispatch(startBookingForItem(item.id));
    }
  }, [booking.itemId, dispatch, item.id]);

  useEffect(() => {
    dispatch(
      setBookingPriceBreakdown({
        rentAmount: subtotal,
        depositAmount,
        serviceFee: 0,
        total: subtotal + depositAmount,
      }),
    );
  }, [depositAmount, dispatch, subtotal]);

  const formatDateShort = (d: Date) =>
    d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

  const handleDateSelect = useCallback((start: Date | null, end: Date | null) => {
    const nextRentalDays = start && end
      ? Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    dispatch(
      setBookingDates({
        startDate: start?.toISOString() ?? null,
        endDate: end?.toISOString() ?? null,
        rentalDays: nextRentalDays,
      }),
    );
  }, [dispatch]);

  const handleCalendarConfirm = useCallback(() => {
    setCalendarOpen(false);
    if (startDate && endDate) {
      dispatch(setBookingStep("confirm_request"));
    }
  }, [dispatch, endDate, startDate]);

  const handleProtectedAction = useCallback(() => {
    if (isGuest) {
      onAuthRequired?.();
      return;
    }
    setCalendarOpen(true);
  }, [isGuest, onAuthRequired]);

  const handlePayment = useCallback(async () => {
    if (isGuest) {
      onAuthRequired?.();
      return;
    }

    if (!booking.startDate || !booking.endDate) {
      setCalendarOpen(true);
      return;
    }

    try {
      const deal = booking.currentDealId
        ? { id: booking.currentDealId }
        : await createDealRequest({
          itemId: item.id,
          startDate: booking.startDate,
          endDate: booking.endDate,
          pricingMode: "PER_DAY",
        });

      dispatch(setBookingDealId(deal.id));
      dispatch(setBookingStep("payment"));

      const payment = await createPayment({
        dealId: deal.id,
        rentalAmount: booking.priceBreakdown?.rentAmount,
        depositAmount: booking.priceBreakdown?.depositAmount,
      });

      if (payment.confirmationUrl) {
        window.location.href = payment.confirmationUrl;
        return;
      }

      dispatch(showToast({ type: "success", message: "Запрос на оплату создан" }));
    } catch {
      dispatch(showToast({ type: "error", message: "Не удалось перейти к оплате" }));
    }
  }, [
    booking.currentDealId,
    booking.endDate,
    booking.priceBreakdown?.depositAmount,
    booking.priceBreakdown?.rentAmount,
    booking.startDate,
    createDealRequest,
    createPayment,
    dispatch,
    isGuest,
    item.id,
    onAuthRequired,
  ]);

  return (
    <aside className={styles.detailSidebar}>
      <motion.div
        className={styles.bookingCard}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Price */}
        <div className={styles.bookingPriceRow}>
          <strong>{primaryPrice}</strong>
          {hourPrice && <span className={styles.bookingHourPrice}>· {hourPrice}</span>}
        </div>

        {/* Availability */}
        <div
          className={clsx(
            styles.bookingAvailability,
            item.isAvailable ? styles.bookingAvailabilityAvailable : styles.bookingAvailabilitySoon,
          )}
        >
          {item.isAvailable ? <Zap size={16} /> : <Clock3 size={16} />}
          {item.isAvailable ? 'Доступно для аренды' : `Доступно с ${item.nearestAvailableDate ?? '—'}`}
        </div>

        {/* Date Selector */}
        <div className={styles.bookingDates}>
          <button type="button" className={styles.bookingDateBtn} onClick={handleProtectedAction}>
            <span className={styles.dateLabel}>Начало</span>
            <span className={startDate ? styles.dateValueActive : styles.dateValue}>
              <Calendar size={14} /> {startDate ? formatDateShort(startDate) : 'Не выбрано'}
            </span>
          </button>
          <button type="button" className={styles.bookingDateBtn} onClick={handleProtectedAction}>
            <span className={styles.dateLabel}>Конец</span>
            <span className={endDate ? styles.dateValueActive : styles.dateValue}>
              <Calendar size={14} /> {endDate ? formatDateShort(endDate) : 'Не выбрано'}
            </span>
          </button>
        </div>

        {/* Pricing Breakdown */}
        <div className={styles.bookingTotal}>
          <div className={styles.totalRow}>
            <span>{formatPrice(String(dailyPrice), '')} × {rentalDays || 1} {pluralize(rentalDays || 1, 'день', 'дня', 'дней')}</span>
            <span>{formatPrice(String(subtotal), '')}</span>
          </div>
          <div className={clsx(styles.totalRow, styles.grandTotal)}>
            <span>Итого</span>
            <span>{formatPrice(String(subtotal), '')}</span>
          </div>
        </div>

        {/* Deposit */}
        {depositLabel && (
          <div className={styles.depositRow}>
            <span><Info size={15} /> Залог (возвратный)</span>
            <span>{depositLabel}</span>
          </div>
        )}

        {/* Actions */}
        <AnimatePresence mode="wait">
          {startDate && endDate ? (
            <motion.div
              key="booked-actions"
              className={styles.bookedActions}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <button
                type="button"
                className={styles.primaryAction}
                disabled={isSubmittingPayment}
                onClick={handlePayment}
              >
                <CreditCard size={18} />
                Перейти к оплате
              </button>
              <button
                type="button"
                className={styles.changeDateBtn}
                onClick={handleProtectedAction}
              >
                <Calendar size={15} />
                Изменить дату
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="book-btn"
              type="button"
              className={styles.primaryAction}
              onClick={handleProtectedAction}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <Calendar size={18} />
              Забронировать
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {calendarOpen ? (
            <RentalCalendar
              startDate={startDate}
              endDate={endDate}
              onSelect={handleDateSelect}
              onConfirm={handleCalendarConfirm}
              onClose={() => setCalendarOpen(false)}
              availability={item.availability}
            />
          ) : null}
        </AnimatePresence>

        <div className={styles.bookingActions}>
          <button type="button" className={styles.secondaryAction} onClick={isGuest ? onAuthRequired : undefined}>
            <MessageCircle size={17} /> Написать
          </button>
        </div>
      </motion.div>

      {/* ─── Owner Card ─── */}
      <div className={styles.ownerCardCompact}>
        <div className={styles.ownerAvatarWrap}>
          <div className={styles.ownerAvatarFallback}>
            {item.ownerName.charAt(0)}
          </div>
          <div className={styles.ownerVerifiedBadge}>
            <CheckCircle2 />
          </div>
        </div>
        <div className={styles.ownerInfo}>
          <span className={styles.sidebarEyebrow}>Владелец</span>
          <span className={styles.ownerName}>{item.ownerName}</span>
          <div className={styles.ownerMeta}>
            <Star size={14} fill="var(--color-warning)" color="var(--color-warning)" />
            {(item.ownerRating ?? 0).toFixed(1)} · {item.ownerReviewCount ?? 0} {pluralize(item.ownerReviewCount ?? 0, 'отзыв', 'отзыва', 'отзывов')}
          </div>
        </div>
      </div>

      {/* ─── Guarantee Card ─── */}
      <div className={styles.guaranteeCard}>
        <ShieldCheck size={20} />
        <div className={styles.guaranteeCardText}>
          <strong>Безопасная сделка</strong>
          <span>Оплата через платформу. Деньги списываются только после получения товара.</span>
        </div>
      </div>
    </aside>
  );
}
