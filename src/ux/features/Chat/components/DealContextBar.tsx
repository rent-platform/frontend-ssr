'use client';

import { Calendar, Package } from 'lucide-react';
import clsx from 'clsx';
import { formatDateRange } from '@/ux/utils';
import type { DealContextBarProps } from '../types';
import styles from '../ChatPage.module.scss';

const DEAL_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Ожидает подтверждения', cls: styles.dealBadgeNew },
  CONFIRMED: { label: 'Подтверждена', cls: styles.dealBadgeConfirmed },
  AWAITING_PAYMENT: { label: 'Ожидает оплаты', cls: styles.dealBadgePayment },
  ACTIVE: { label: 'В аренде', cls: styles.dealBadgeActive },
  COMPLETED: { label: 'Завершена', cls: styles.dealBadgeCompleted },
  REJECTED: { label: 'Отклонена', cls: styles.dealBadgeRejected },
  CANCELLED: { label: 'Отменена', cls: styles.dealBadgeRejected },
};

export function DealContextBar({ chat }: DealContextBarProps) {
  const badge = chat.dealStatus ? DEAL_STATUS_LABELS[chat.dealStatus] : null;

  return (
    <div className={styles.dealBar}>
      {chat.itemImage ? (
        <img src={chat.itemImage} alt="" className={styles.dealBarImg} />
      ) : (
        <div className={styles.dealBarPlaceholder}><Package /></div>
      )}
      <div className={styles.dealBarInfo}>
        <div className={styles.dealBarTitleRow}>
          <div className={styles.dealBarTitle}>{chat.itemTitle}</div>
          {badge && (
            <span className={clsx(styles.dealBadge, badge.cls)}>{badge.label}</span>
          )}
        </div>
        <div className={styles.dealBarMeta}>
          {chat.dealPrice && <span>{chat.dealPrice} ₽/сутки</span>}
          {chat.dealDates && (
            <span>
              <Calendar size={10} className="inlineIcon" />
              {formatDateRange(chat.dealDates.start, chat.dealDates.end)}
            </span>
          )}
          {chat.dealDeposit && <span>Залог {chat.dealDeposit} ₽</span>}
        </div>
      </div>
    </div>
  );
}
