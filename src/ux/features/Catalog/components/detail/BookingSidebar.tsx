'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Info,
  MessageCircle,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import type { CatalogUiItem } from '../../types';
import { useCreateDealRequest } from '@/business/deals/hooks';
import { pluralize, formatPrice, ROUTES } from '@/ux/utils';
import {
  formatCatalogCardHourSecondary,
  formatCatalogCardPrimaryPrice,
  formatDepositAmount,
} from '../../utils';
import { RentalCalendar } from './RentalCalendar';
import Link from 'next/link';
import styles from '../../Catalog.module.scss';

type BookingSidebarProps = {
  item: CatalogUiItem;
  isGuest: boolean;
  onAuthRequired?: () => void;
};

export function BookingSidebar({ item, isGuest, onAuthRequired }: BookingSidebarProps) {
  const router = useRouter();
  const { createDealRequest, isCreating, isSuccess, isError, deal: createdDeal } = useCreateDealRequest();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [comment, setComment] = useState('');

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

  const formatDateShort = (d: Date) =>
    d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

  const handleDateSelect = useCallback((start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const handleCalendarConfirm = useCallback(() => {
    setCalendarOpen(false);
  }, []);

  const handleProtectedAction = useCallback(() => {
    if (isGuest) {
      onAuthRequired?.();
      return;
    }
    setCalendarOpen(true);
  }, [isGuest, onAuthRequired]);

  const handleSubmitRequest = useCallback(async () => {
    if (isGuest) {
      onAuthRequired?.();
      return;
    }
    if (!startDate || !endDate) return;

    const toISODate = (d: Date) => d.toISOString().split('T')[0];
    const pricingMode = item.pricePerDay ? 'DAY' : 'HOUR';

    try {
      await createDealRequest({
        itemId: item.id,
        startDate: toISODate(startDate),
        endDate: toISODate(endDate),
        pricingMode,
      });
    } catch {
      router.push(ROUTES.deal());
    }
  }, [isGuest, onAuthRequired, startDate, endDate, item, createDealRequest, router]);

  useEffect(() => {
    if (isSuccess && createdDeal) {
      router.push(ROUTES.deal(createdDeal.id));
    } else if (isSuccess && !createdDeal) {
      router.push(ROUTES.deal());
    } else if (isError) {
      router.push(ROUTES.deal());
    }
  }, [isSuccess, isError, createdDeal, router]);

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
          <div className={styles.bookingDateBtn}>
            <span className={styles.dateLabel}>Начало</span>
            <span className={startDate ? styles.dateValueActive : styles.dateValue}>
              <Calendar size={14} /> {startDate ? formatDateShort(startDate) : 'Не выбрано'}
            </span>
          </div>
          <div className={styles.bookingDateBtn}>
            <span className={styles.dateLabel}>Конец</span>
            <span className={endDate ? styles.dateValueActive : styles.dateValue}>
              <Calendar size={14} /> {endDate ? formatDateShort(endDate) : 'Не выбрано'}
            </span>
          </div>
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

        {/* Comment */}
        {startDate && endDate && (
          <div className={styles.commentSection}>
            <label className={styles.commentLabel}>Комментарий к запросу</label>
            <textarea
              className={styles.commentTextarea}
              placeholder="Опишите детали или пожелания к аренде..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* Service fee notice */}
        <div className={styles.serviceFeeRow}>
          <span><Info size={14} /> Сервисный сбор</span>
          <span>10% с арендодателя</span>
        </div>

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
                onClick={handleSubmitRequest}
                disabled={isCreating}
              >
                <CreditCard size={18} />
                {isCreating ? 'Отправка...' : 'Отправить запрос'}
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
      <Link
        href={isGuest ? '#' : `${ROUTES.publicProfile(item.ownerId)}?from=${item.id}`}
        className={styles.ownerCardCompact}
        onClick={(e) => {
          if (isGuest) {
            e.preventDefault();
            onAuthRequired?.();
          }
        }}
      >
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
        <ChevronRight size={18} className={styles.ownerCardArrow} />
      </Link>

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
