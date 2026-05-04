'use client';

import { Calendar, Package } from 'lucide-react';
import { formatDateRange } from '@/ux/utils';
import type { ChatPreview } from '../types';
import styles from '../ChatPage.module.scss';

const DEAL_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  new: { label: 'Новая заявка', cls: styles.dealBadgeNew },
  confirmed: { label: 'Подтверждена', cls: styles.dealBadgeConfirmed },
  active: { label: 'Активна', cls: styles.dealBadgeActive },
  completed: { label: 'Завершена', cls: styles.dealBadgeCompleted },
  rejected: { label: 'Отклонена', cls: styles.dealBadgeRejected },
};

export function DealContextBar({ chat }: { chat: ChatPreview }) {
  const badge = chat.dealStatus ? DEAL_STATUS_LABELS[chat.dealStatus] : null;

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
      {badge && (
        <span className={`${styles.dealBadge} ${badge.cls}`}>{badge.label}</span>
      )}
    </div>
  );
}
