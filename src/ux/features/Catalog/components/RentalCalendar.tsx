'use client';

import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './RentalCalendar.module.scss';

type RentalCalendarProps = {
  startDate: Date | null;
  endDate: Date | null;
  onSelect: (start: Date | null, end: Date | null) => void;
  onConfirm: () => void;
  onClose: () => void;
};

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function isBetween(day: Date, start: Date, end: Date) {
  return day.getTime() > start.getTime() && day.getTime() < end.getTime();
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function RentalCalendar({
  startDate,
  endDate,
  onSelect,
  onConfirm,
  onClose,
}: RentalCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewDate, setViewDate] = useState(() => startDate ?? today);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const prevMonth = useCallback(() => {
    setViewDate(new Date(year, month - 1, 1));
  }, [year, month]);

  const nextMonth = useCallback(() => {
    setViewDate(new Date(year, month + 1, 1));
  }, [year, month]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    let startWeekday = firstDay.getDay();
    // Convert Sunday=0 to Monday-based: Mon=0, Sun=6
    startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date | null; key: string }> = [];

    // Padding for previous month
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ date: null, key: `pad-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ date, key: `${year}-${month}-${d}` });
    }

    return cells;
  }, [year, month]);

  const handleDayClick = useCallback(
    (day: Date) => {
      if (day < today) return;

      if (!startDate || (startDate && endDate)) {
        // Start new selection
        onSelect(day, null);
      } else {
        // Set end date
        if (day < startDate) {
          onSelect(day, null);
        } else if (isSameDay(day, startDate)) {
          return;
        } else {
          onSelect(startDate, day);
        }
      }
    },
    [startDate, endDate, onSelect, today],
  );

  const getDayState = useCallback(
    (day: Date) => {
      const isPast = day < today;
      const isToday = isSameDay(day, today);
      const isStart = startDate ? isSameDay(day, startDate) : false;
      const isEnd = endDate ? isSameDay(day, endDate) : false;
      const inRange = startDate && endDate ? isBetween(day, startDate, endDate) : false;

      return { isPast, isToday, isStart, isEnd, inRange };
    },
    [startDate, endDate, today],
  );

  const canGoPrev = !(year === today.getFullYear() && month === today.getMonth());

  const selectionSummary = useMemo(() => {
    if (!startDate) return null;
    if (!endDate) return 'Выберите дату окончания';
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dayWord = diff === 1 ? 'день' : diff < 5 ? 'дня' : 'дней';
    return `${diff} ${dayWord}`;
  }, [startDate, endDate]);

  return createPortal(
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.calendar}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={prevMonth}
            disabled={!canGoPrev}
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft size={18} />
          </button>
          <span className={styles.monthLabel}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            type="button"
            className={styles.navBtn}
            onClick={nextMonth}
            aria-label="Следующий месяц"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Weekday names */}
        <div className={styles.weekdays}>
          {WEEKDAYS.map((wd) => (
            <span key={wd} className={styles.weekday}>{wd}</span>
          ))}
        </div>

        {/* Days grid */}
        <div className={styles.grid}>
          {calendarDays.map(({ date, key }) => {
            if (!date) {
              return <span key={key} className={styles.emptyCell} />;
            }

            const { isPast, isToday, isStart, isEnd, inRange } = getDayState(date);

            const cellClass = [
              styles.day,
              isPast && styles.dayPast,
              isToday && !isStart && styles.dayToday,
              isStart && styles.dayStart,
              isEnd && styles.dayEnd,
              inRange && styles.dayInRange,
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={key}
                type="button"
                className={cellClass}
                disabled={isPast}
                onClick={() => handleDayClick(date)}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.summary}>
            {selectionSummary ?? 'Выберите дату начала'}
          </span>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Отмена
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              disabled={!startDate || !endDate}
              onClick={onConfirm}
            >
              Готово
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
