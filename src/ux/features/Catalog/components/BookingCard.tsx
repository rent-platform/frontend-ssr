import { useMemo, useState } from 'react';
import type { CatalogUiItem } from '../types';
import { formatPrice } from '../utils';
import styles from '../Catalog.module.scss';

type BookingCardProps = {
  item: CatalogUiItem;
};

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;
const DURATIONS = [1, 3, 7] as const;

const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

function toMidnight(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function differenceInDays(start: Date, end: Date) {
  const diff = toMidnight(end).getTime() - toMidnight(start).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export function BookingCard({ item }: BookingCardProps) {
  const today = useMemo(() => toMidnight(new Date()), []);
  const initialStart = useMemo(() => addDays(today, 2), [today]);
  const initialEnd = useMemo(() => addDays(today, 5), [today]);
  const [selectedStart, setSelectedStart] = useState(initialStart);
  const [selectedEnd, setSelectedEnd] = useState(initialEnd);

  const rentalDays = differenceInDays(selectedStart, selectedEnd);
  const dailyPrice = Number(item.price_per_day ?? item.price_per_hour ?? 0);
  const serviceFee = Math.max(290, Math.round(dailyPrice * 0.08));
  const total = dailyPrice * rentalDays + serviceFee;

  const bookedDays = useMemo(() => {
    const values = [1, 6, 12].map((offset) => addDays(today, offset).getDate());
    return new Set(values);
  }, [today]);

  const calendarCells = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const shift = (firstDay.getDay() + 6) % 7;
    const cells: Array<{ type: 'empty' } | { type: 'day'; day: number; disabled: boolean; inRange: boolean; selected: boolean }> = [];

    for (let index = 0; index < shift; index += 1) {
      cells.push({ type: 'empty' });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const disabled = date <= today || bookedDays.has(day);
      const selected =
        day === selectedStart.getDate() || day === selectedEnd.getDate();
      const inRange = date > selectedStart && date < selectedEnd;

      cells.push({ type: 'day', day, disabled, inRange, selected });
    }

    return cells;
  }, [bookedDays, selectedEnd, selectedStart, today]);

  const handlePresetClick = (duration: (typeof DURATIONS)[number]) => {
    setSelectedStart(initialStart);
    setSelectedEnd(addDays(initialStart, duration));
  };

  const handleDayClick = (day: number) => {
    const nextDate = new Date(today.getFullYear(), today.getMonth(), day);

    if (nextDate <= today || bookedDays.has(day)) {
      return;
    }

    if (nextDate <= selectedStart || nextDate <= selectedEnd) {
      setSelectedStart(nextDate);
      setSelectedEnd(addDays(nextDate, rentalDays));
      return;
    }

    setSelectedEnd(nextDate);
  };

  return (
    <div className={styles.bookingCard}>
      <div className={styles.bookingCardHeader}>
        <div>
          <p className={styles.sidebarEyebrow}>Бронирование</p>
          <h3>Забронировать вещь</h3>
        </div>
        <div className={styles.bookingStatusRow}>
          <span className={styles.bookingStatusActive}>Доступно</span>
          <span className={styles.bookingStatusNeutral}>Безопасная сделка</span>
        </div>
      </div>

      <div className={styles.detailPriceBlock}>
        <strong>{formatPrice(item.price_per_day, '/сутки')}</strong>
        <span>{item.price_per_hour ? formatPrice(item.price_per_hour, '/час') : 'Почасовой тариф по запросу'}</span>
      </div>

      <div className={styles.bookingFieldGrid}>
        <div className={styles.bookingFieldCard}>
          <span>Дата начала</span>
          <strong>{shortDateFormatter.format(selectedStart)}</strong>
        </div>
        <div className={styles.bookingFieldCard}>
          <span>Дата возврата</span>
          <strong>{shortDateFormatter.format(selectedEnd)}</strong>
        </div>
      </div>

      <div className={styles.bookingCalendarCard}>
        <div className={styles.bookingCalendarHeader}>
          <strong>{monthFormatter.format(today)}</strong>
          <span>Выбери дату начала или окончания аренды</span>
        </div>

        <div className={styles.bookingWeekdays}>
          {WEEK_DAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className={styles.bookingCalendarGrid}>
          {calendarCells.map((cell, index) => {
            if (cell.type === 'empty') {
              return <span key={`empty-${index}`} className={styles.bookingCalendarEmpty} />;
            }

            const className = [styles.bookingCalendarDay];
            if (cell.disabled) className.push(styles.bookingCalendarDayDisabled);
            if (cell.inRange) className.push(styles.bookingCalendarDayInRange);
            if (cell.selected) className.push(styles.bookingCalendarDaySelected);

            return (
              <button
                key={cell.day}
                type="button"
                className={className.join(' ')}
                onClick={() => handleDayClick(cell.day)}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.bookingPresets}>
        {DURATIONS.map((duration) => (
          <button
            key={duration}
            type="button"
            className={duration === rentalDays ? styles.bookingPresetActive : styles.bookingPreset}
            onClick={() => handlePresetClick(duration)}
          >
            {duration} {duration === 1 ? 'сутки' : duration < 5 ? 'суток' : 'суток'}
          </button>
        ))}
      </div>

      <div className={styles.bookingSummary}>
        <div className={styles.bookingSummaryRow}>
          <span>Аренда × {rentalDays}</span>
          <strong>{formatPrice(String(dailyPrice * rentalDays), '')}</strong>
        </div>
        <div className={styles.bookingSummaryRow}>
          <span>Сервисный сбор</span>
          <strong>{formatPrice(String(serviceFee), '')}</strong>
        </div>
        <div className={styles.bookingSummaryRow}>
          <span>Залог</span>
          <strong>{formatPrice(item.deposit_amount, '')}</strong>
        </div>
        <div className={styles.bookingSummaryTotal}>
          <span>К оплате сейчас</span>
          <strong>{formatPrice(String(total), '')}</strong>
        </div>
      </div>

      <div className={styles.detailActionRow}>
        <button type="button" className={styles.primaryAction}>
          Забронировать
        </button>
        <button type="button" className={styles.secondaryAction}>
          Написать владельцу
        </button>
      </div>

      <ul className={styles.bookingMetaList}>
        <li>Бесплатная отмена в течение 2 часов после оформления</li>
        <li>Самовывоз: {item.pickup_location}</li>
        <li>Окно выдачи: {item.pickupWindow}</li>
      </ul>
    </div>
  );
}
