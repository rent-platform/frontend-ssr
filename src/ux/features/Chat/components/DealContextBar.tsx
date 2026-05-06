'use client';

import { Calendar, Package } from 'lucide-react';
import { formatDateRange } from '@/ux/utils';
import type { ChatPreview } from '../types';
import styles from '../ChatPage.module.scss';

const DEAL_STATUS_CLS: Record<string, string> = {
  PENDING: styles.dealBadgeNew,
  CONFIRMED: styles.dealBadgeConfirmed,
  ACTIVE: styles.dealBadgeActive,
  COMPLETED: styles.dealBadgeCompleted,
  REJECTED: styles.dealBadgeRejected,
};

export function DealContextBar({ chat }: { chat: ChatPreview }) {
  const badgeClass = chat.dealStatus ? DEAL_STATUS_CLS[chat.dealStatus] : null;

  return (
    <div className={styles.dealBar}>
      {chat.itemImage ? (
        <img src={chat.itemImage} alt="" className={styles.dealBarImg} />
      ) : (
        <div className={styles.dealBarPlaceholder}><Package /></div>
      )}
      <div className={styles.dealBarInfo}>
        <div className={styles.dealBarTitle}>{chat.itemTitle}</div>
        <div className={styles.dealBarMeta}>
          {chat.dealPrice && <span>{chat.dealPrice} ₽/сутки</span>}
          {chat.dealDates && (
            <span>
              <Calendar size={10} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 2 }} />
              {formatDateRange(chat.dealDates.start, chat.dealDates.end)}
            </span>
          )}
          {chat.dealDeposit && <span>Залог {chat.dealDeposit} ₽</span>}
        </div>
      </div>
      {chat.dealStatus && chat.dealStatusLabel && (
        <span className={`${styles.dealBadge} ${badgeClass ?? ''}`}>
          {chat.dealStatusLabel}
        </span>
      )}
    </div>
  );
}
