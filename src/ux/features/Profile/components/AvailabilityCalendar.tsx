'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import type { ProfileBooking } from '../types';
import type { UiDealStatus } from '@/ux/types';
import { pluralize } from '@/ux/utils';
import s from './AvailabilityCalendar.module.scss';

type AvailabilityCalendarProps = {
  bookings: ProfileBooking[];
};

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const ACTIVE_STATUSES: UiDealStatus[] = ['ACTIVE', 'CONFIRMED', 'AWAITING_PAYMENT', 'PENDING'];

type BookedDay = {
  status: UiDealStatus;
  renter: string;
  isStart: boolean;
  isEnd: boolean;
};

const STATUS_LABEL_SHORT: Record<UiDealStatus, string> = {
  ACTIVE: 'В аренде',
  CONFIRMED: 'Подтв.',
  AWAITING_PAYMENT: 'Ожид. оплаты',
  PENDING: 'Заявка',
  COMPLETED: 'Завершена',
  REJECTED: 'Отклонена',
  CANCELLED: 'Отменена',
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

const STATUS_PRIORITY: Record<string, number> = {
  ACTIVE: 4,
  AWAITING_PAYMENT: 3,
  CONFIRMED: 2,
  PENDING: 1,
};

function buildBookedMap(bookings: ProfileBooking[]): Map<string, BookedDay> {
  const map = new Map<string, BookedDay>();

  for (const b of bookings) {
    if (!ACTIVE_STATUSES.includes(b.status)) continue;
    const start = startOfDay(new Date(b.startDate));
    const end = startOfDay(new Date(b.endDate));
    const cursor = new Date(start);

    while (cursor <= end) {
      const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
      const existing = map.get(key);
      if (!existing || (STATUS_PRIORITY[b.status] ?? 0) > (STATUS_PRIORITY[existing.status] ?? 0)) {
        map.set(key, {
          status: b.status,
          renter: b.counterpartyName,
          isStart: isSameDay(cursor, start),
          isEnd: isSameDay(cursor, end),
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return map;
}

const STATUS_DAY_CLS: Record<string, string> = {
  ACTIVE: s.dayBooked,
  CONFIRMED: s.dayConfirmed,
  AWAITING_PAYMENT: s.dayPayment,
  PENDING: s.dayPending,
};

export function AvailabilityCalendar({ bookings }: AvailabilityCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const bookedMap = useMemo(() => buildBookedMap(bookings), [bookings]);

  const prevMonth = useCallback(() => {
    setViewDate(new Date(year, month - 1, 1));
  }, [year, month]);

  const nextMonth = useCallback(() => {
    setViewDate(new Date(year, month + 1, 1));
  }, [year, month]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    let startWeekday = firstDay.getDay();
    startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date | null; key: string }> = [];

    for (let i = 0; i < startWeekday; i++) {
      cells.push({ date: null, key: `pad-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ date, key: `${year}-${month}-${d}` });
    }

    return cells;
  }, [year, month]);

  const canGoPrev = !(year === today.getFullYear() && month === today.getMonth());

  const monthStats = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let blocked = 0;
    let requested = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${month}-${d}`;
      const entry = bookedMap.get(key);
      if (entry) {
        if (entry.status === 'PENDING') requested++;
        else blocked++;
      }
    }
    const occupied = blocked + requested;
    const available = daysInMonth - occupied;
    const pct = daysInMonth > 0 ? Math.round((occupied / daysInMonth) * 100) : 0;
    return { total: daysInMonth, blocked, requested, available, pct };
  }, [year, month, bookedMap]);

  return (
    <motion.section
      className={s.wrapper}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className={s.calendarCard}>
        {/* ── Header with stats ── */}
        <div className={s.cardHeader}>
          <div className={s.cardTitleRow}>
            <div className={s.cardTitleIcon}><CalendarDays size={16} /></div>
            <h3 className={s.cardTitle}>Календарь доступности</h3>
          </div>
          <div className={s.headerStats}>
            <span className={s.headerStatGreen}>{monthStats.available} {pluralize(monthStats.available, 'день', 'дня', 'дней')} свободно</span>
            {monthStats.blocked > 0 && (
              <>
                <span className={s.headerStatDot} />
                <span className={s.headerStatMuted}>{monthStats.blocked} занято</span>
              </>
            )}
            {monthStats.requested > 0 && (
              <>
                <span className={s.headerStatDot} />
                <span className={s.headerStatMuted}>{monthStats.requested} {pluralize(monthStats.requested, 'заявка', 'заявки', 'заявок')}</span>
              </>
            )}
            {monthStats.pct > 0 && (
              <>
                <span className={s.headerStatDot} />
                <span className={s.headerStatBadge}>
                  <TrendingUp size={11} />
                  {monthStats.pct}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Month nav ── */}
        <div className={s.monthNav}>
          <button
            type="button"
            className={s.navBtn}
            onClick={prevMonth}
            disabled={!canGoPrev}
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft size={16} />
          </button>
          <span className={s.monthLabel}>
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            type="button"
            className={s.navBtn}
            onClick={nextMonth}
            aria-label="Следующий месяц"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Weekday names ── */}
        <div className={s.weekdays}>
          {WEEKDAYS.map((wd) => (
            <span key={wd} className={s.weekday}>{wd}</span>
          ))}
        </div>

        {/* ── Days grid ── */}
        <div className={s.grid}>
          {calendarDays.map(({ date, key }) => {
            if (!date) {
              return <span key={key} className={s.emptyCell} />;
            }

            const isPast = date < today && !isSameDay(date, today);
            const isToday = isSameDay(date, today);
            const mapKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            const booked = bookedMap.get(mapKey);

            const cellClass = clsx(
              s.day,
              isPast && s.dayPast,
              isToday && s.dayToday,
              booked && STATUS_DAY_CLS[booked.status],
              booked?.isStart && s.dayRangeStart,
              booked?.isEnd && s.dayRangeEnd,
              booked && !booked.isStart && !booked.isEnd && s.dayRangeMid,
            );

            const tooltip = booked
              ? `${STATUS_LABEL_SHORT[booked.status]} · ${booked.renter}`
              : isToday
                ? 'Сегодня — доступно'
                : undefined;

            return (
              <div
                key={key}
                className={cellClass}
                title={tooltip}
              >
                <span className={s.dayNum}>{date.getDate()}</span>
                {isToday && <span className={s.todayDot} />}
              </div>
            );
          })}
        </div>

        {/* ── Legend ── */}
        <div className={s.legend}>
          <div className={s.legendItem}>
            <span className={clsx(s.legendDot, s.legendAvailable)} />
            <span>Доступно</span>
          </div>
          <div className={s.legendItem}>
            <span className={clsx(s.legendDot, s.legendActive)} />
            <span>В аренде</span>
          </div>
          <div className={s.legendItem}>
            <span className={clsx(s.legendDot, s.legendConfirmed)} />
            <span>Подтверждена</span>
          </div>
          <div className={s.legendItem}>
            <span className={clsx(s.legendDot, s.legendPayment)} />
            <span>Ожидает оплаты</span>
          </div>
          <div className={s.legendItem}>
            <span className={clsx(s.legendDot, s.legendPending)} />
            <span>Заявка</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
