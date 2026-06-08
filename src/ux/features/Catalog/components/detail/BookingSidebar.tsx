"use client";

import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
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
} from "lucide-react";
import { useRentalBooking } from "@/business/deals";
import type { CatalogUiItem } from "../../types";
import { pluralize } from "@/ux/utils";
import {
  formatCatalogCardHourSecondary,
  formatCatalogCardPrimaryPrice,
  formatDepositAmount,
  formatPrice,
} from "../../utils";
import { RentalCalendar } from "./RentalCalendar";
import styles from "../../Catalog.module.scss";

type BookingSidebarProps = {
  item: CatalogUiItem;
  isGuest: boolean;
  onAuthRequired?: () => void;
};

function formatDateShort(date: Date) {
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

export function BookingSidebar({
  item,
  isGuest,
  onAuthRequired,
}: BookingSidebarProps) {
  const {
    availability,
    calendarOpen,
    dailyPrice,
    depositAmount,
    endDate,
    handleCalendarConfirm,
    handleCloseCalendar,
    handleDateSelect,
    handleMonthChange,
    handleOpenChat,
    handlePayment,
    handleProtectedAction,
    isCreatingChat,
    isSubmittingRequest,
    rentalDays,
    startDate,
    subtotal,
  } = useRentalBooking({ item, isGuest, onAuthRequired });

  const primaryPrice = formatCatalogCardPrimaryPrice(item);
  const hourPrice = formatCatalogCardHourSecondary(item);
  const depositLabel =
    depositAmount > 0 ? formatDepositAmount(item.depositAmount) : null;

  return (
    <aside className={styles.detailSidebar}>
      <motion.div
        className={styles.bookingCard}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className={styles.bookingPriceRow}>
          <strong>{primaryPrice}</strong>
          {hourPrice && (
            <span className={styles.bookingHourPrice}>· {hourPrice}</span>
          )}
        </div>

        <div
          className={clsx(
            styles.bookingAvailability,
            item.isAvailable
              ? styles.bookingAvailabilityAvailable
              : styles.bookingAvailabilitySoon,
          )}
        >
          {item.isAvailable ? <Zap size={16} /> : <Clock3 size={16} />}
          {item.isAvailable
            ? "Доступно для аренды"
            : `Доступно с ${item.nearestAvailableDate ?? "—"}`}
        </div>

        <div className={styles.bookingDates}>
          <button
            type="button"
            className={styles.bookingDateBtn}
            onClick={handleProtectedAction}
          >
            <span className={styles.dateLabel}>Начало</span>
            <span
              className={startDate ? styles.dateValueActive : styles.dateValue}
            >
              <Calendar size={14} />{" "}
              {startDate ? formatDateShort(startDate) : "Не выбрано"}
            </span>
          </button>
          <button
            type="button"
            className={styles.bookingDateBtn}
            onClick={handleProtectedAction}
          >
            <span className={styles.dateLabel}>Конец</span>
            <span
              className={endDate ? styles.dateValueActive : styles.dateValue}
            >
              <Calendar size={14} />{" "}
              {endDate ? formatDateShort(endDate) : "Не выбрано"}
            </span>
          </button>
        </div>

        <div className={styles.bookingTotal}>
          <div className={styles.totalRow}>
            <span>
              {formatPrice(String(dailyPrice), "")} × {rentalDays || 1}{" "}
              {pluralize(rentalDays || 1, "день", "дня", "дней")}
            </span>
            <span>{formatPrice(String(subtotal), "")}</span>
          </div>
          <div className={clsx(styles.totalRow, styles.grandTotal)}>
            <span>Итого</span>
            <span>{formatPrice(String(subtotal), "")}</span>
          </div>
        </div>

        {depositLabel && (
          <div className={styles.depositRow}>
            <span>
              <Info size={15} /> Залог (возвратный)
            </span>
            <span>{depositLabel}</span>
          </div>
        )}

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
                disabled={isSubmittingRequest}
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
              onClose={handleCloseCalendar}
              onMonthChange={handleMonthChange}
              availability={availability}
            />
          ) : null}
        </AnimatePresence>

        <div className={styles.bookingActions}>
          <button
            type="button"
            className={styles.secondaryAction}
            disabled={isCreatingChat}
            onClick={handleOpenChat}
          >
            <MessageCircle size={17} /> Написать
          </button>
        </div>
      </motion.div>

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
            <Star
              size={14}
              fill="var(--color-warning)"
              color="var(--color-warning)"
            />
            {(item.ownerRating ?? 0).toFixed(1)} ·{" "}
            {item.ownerReviewCount ?? 0}{" "}
            {pluralize(
              item.ownerReviewCount ?? 0,
              "отзыв",
              "отзыва",
              "отзывов",
            )}
          </div>
        </div>
      </div>

      <div className={styles.guaranteeCard}>
        <ShieldCheck size={20} />
        <div className={styles.guaranteeCardText}>
          <strong>Безопасная сделка</strong>
          <span>
            Оплата через платформу. Деньги списываются только после получения
            товара.
          </span>
        </div>
      </div>
    </aside>
  );
}
