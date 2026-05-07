'use client';

import Link from 'next/link';
import { Package, Star } from 'lucide-react';
import clsx from 'clsx';
import type { NotificationItem } from '../types';
import { timeAgo } from '@/ux/utils';
import { getIconProps, DEAL_STATUS_CLS, DEAL_STATUS_LABEL } from './notificationHelpers';
import styles from '../NotificationsPage.module.scss';

type NotificationCardProps = {
  notification: NotificationItem;
  onRead: (id: string) => void;
};

export function NotificationCard({ notification: ntf, onRead }: NotificationCardProps) {
  const { Icon, cls: iconCls } = getIconProps(ntf.type);

  const priorityCls =
    ntf.priority === 'urgent'
      ? styles.cardUrgent
      : ntf.priority === 'high'
        ? styles.cardHigh
        : '';

  const handleClick = () => {
    if (!ntf.isRead) onRead(ntf.id);
  };

  const card = (
    <div
      className={clsx(styles.card, !ntf.isRead && styles.cardUnread, priorityCls)}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
    >
      <div className={clsx(styles.iconCircle, iconCls)}>
        <Icon />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h4 className={clsx(styles.cardTitle, !ntf.isRead && styles.cardTitleUnread)}>
            {ntf.title}
          </h4>
          {!ntf.isRead && <span className={styles.unreadDot} />}
        </div>

        <p className={styles.cardText}>{ntf.body}</p>

        <div className={styles.cardMeta}>
          <span className={styles.cardTime}>{timeAgo(ntf.createdAt)}</span>

          {ntf.meta?.itemTitle && (
            <span className={styles.cardItemTag}>
              <Package size={10} />
              {ntf.meta.itemTitle}
            </span>
          )}

          {ntf.meta?.amount && (
            <span
              className={clsx(styles.cardAmount,
                (ntf.type === 'payment_received' || ntf.type === 'deposit_returned') && styles.cardAmountPositive,
                (ntf.type === 'payment_sent' || ntf.type === 'deposit_held') && styles.cardAmountNegative,
              )}
            >
              {ntf.type === 'payment_received' || ntf.type === 'deposit_returned' ? '+' : ''}
              {ntf.type === 'payment_sent' || ntf.type === 'deposit_held' ? '−' : ''}
              {ntf.meta.amount.toLocaleString('ru-RU')} {ntf.meta.currency ?? '₽'}
            </span>
          )}

          {ntf.meta?.rating && (
            <span className={styles.cardRating}>
              <Star size={11} />
              {ntf.meta.rating}
            </span>
          )}
        </div>
      </div>

      <div className={styles.cardRight}>
        {ntf.meta?.dealStatus && (
          <span className={clsx(styles.statusBadge, DEAL_STATUS_CLS[ntf.meta.dealStatus])}>
            {DEAL_STATUS_LABEL[ntf.meta.dealStatus] ?? ntf.meta.dealStatus}
          </span>
        )}
        {ntf.actionLabel && (
          <button
            type="button"
            className={styles.cardAction}
            onClick={(e) => e.stopPropagation()}
          >
            {ntf.actionLabel}
          </button>
        )}
      </div>
    </div>
  );

  if (ntf.actionUrl) {
    return (
      <Link href={ntf.actionUrl} className="unstyledLink">
        {card}
      </Link>
    );
  }

  return card;
}
