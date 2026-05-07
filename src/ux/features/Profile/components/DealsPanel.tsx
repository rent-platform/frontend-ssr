'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Camera, Shield, ShoppingBag, Upload, User } from 'lucide-react';
import clsx from 'clsx';
import { pluralize, formatDate, EASE } from '@/ux/utils';
import type { ProfileBooking, BookingSide } from '../types';
import { MOCK_BOOKINGS } from '../mockProfileData';
import { BOOKING_FILTERS, DEAL_STATUS_MAP } from '../profileHelpers';
import type { BookingFilter } from '../profileHelpers';
import { EmptyState } from './EmptyState';
import styles from '../ProfileDashboard.module.scss';

function BookingRow({ booking, counterLabel }: { booking: ProfileBooking; counterLabel: string }) {
  const st = DEAL_STATUS_MAP[booking.status];

  return (
    <div className={styles.bookingCard}>
      <div className={styles.bookingImageArea}>
        <div className={styles.bookingBadgeRow}>
          <span className={clsx(styles.statusBadge, st.cls)}>{st.label}</span>
        </div>
        {booking.itemImage ? (
          <img src={booking.itemImage} alt={booking.itemTitle} className={styles.bookingImg} />
        ) : (
          <div className={styles.bookingImgFallback}><Camera size={24} /></div>
        )}
      </div>

      <div className={styles.bookingInfo}>
        <div className={styles.bookingTop}>
          <span className={styles.bookingTitle}>{booking.itemTitle}</span>
          <span className={styles.bookingMeta}>
            <User size={14} /> {counterLabel}: {booking.counterpartyName}
          </span>
          <span className={styles.bookingMeta}>
            <Calendar size={14} /> {formatDate(booking.startDate)} — {formatDate(booking.endDate)}
          </span>
        </div>

        <div className={styles.bookingChips}>
          <span className={styles.bookingChip}>
            <Shield size={12} />
            Залог {Number(booking.depositAmount).toLocaleString('ru-RU')} ₽
          </span>
        </div>

        <div className={styles.bookingFooter}>
          <div className={styles.bookingPriceBlock}>
            <strong>{Number(booking.totalPrice).toLocaleString('ru-RU')} ₽</strong>
            <span>за период</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DealsPanel({ side, onSideChange, filter, onFilterChange }: { side: BookingSide; onSideChange: (s: BookingSide) => void; filter: BookingFilter; onFilterChange: (f: BookingFilter) => void }) {
  const filtered = useMemo(() => {
    const bySide = MOCK_BOOKINGS.filter((b) => b.side === side);
    return filter === 'all' ? bySide : bySide.filter((b) => b.status === filter);
  }, [side, filter]);

  const counterLabel = side === 'owner' ? 'Арендатор' : 'Владелец';

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Мои аренды</h2>
          <p className={styles.panelSubtitle}>
            {side === 'owner' ? 'Вещи, которые вы сдаёте в аренду' : 'Вещи, которые вы арендуете'}
            {' · '}{filtered.length} {pluralize(filtered.length, 'сделка', 'сделки', 'сделок')}
          </p>
        </div>
      </div>

      {/* Side toggle */}
      <div className={styles.sideToggle}>
        <button
          type="button"
          className={clsx(styles.sideToggleBtn, side === 'owner' && styles.sideToggleBtnActive)}
          onClick={() => { onSideChange('owner'); onFilterChange('all'); }}
        >
          <Upload size={14} /> Сдаю
        </button>
        <button
          type="button"
          className={clsx(styles.sideToggleBtn, side === 'renter' && styles.sideToggleBtnActive)}
          onClick={() => { onSideChange('renter'); onFilterChange('all'); }}
        >
          <ShoppingBag size={14} /> Арендую
        </button>
      </div>

      {/* Status filters */}
      <div className={styles.filterPills}>
        {BOOKING_FILTERS.map((f) => (
          <button key={f.value} type="button" className={clsx(styles.filterPill, filter === f.value && styles.filterPillActive, styles.tooltipWrap)} onClick={() => onFilterChange(f.value)}>
            {f.label}
            <span className={styles.tooltipBubble}>{f.tip}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={side === 'owner' ? <Upload /> : <ShoppingBag />} title={side === 'owner' ? 'Нет аренд по сдаче' : 'Вы пока ничего не арендовали'} text="По этому фильтру ничего не найдено" />
      ) : (
        <div className={styles.bookingsGrid}>
          {filtered.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}>
              <BookingRow booking={b} counterLabel={counterLabel} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
