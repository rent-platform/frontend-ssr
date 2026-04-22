'use client';

import { useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  BellOff,
  Bookmark,
  Calendar,
  Check,
  CheckCheck,
  CreditCard,
  Gift,
  Lock,
  MessageSquare,
  Package,
  Settings,
  Shield,
  Star,
  Wallet,
} from 'lucide-react';
import type {
  NotificationItem,
  NotificationType,
  NotificationTab,
} from './types';
import {
  NOTIFICATION_TAB_LABELS,
  TAB_TYPE_MAP,
} from './types';
import { MOCK_NOTIFICATIONS } from './mockNotifications';
import styles from './NotificationsPage.module.scss';

/* ─── Helpers ─── */

function timeAgo(iso: string): string {
  const now = Date.now();
  const d = new Date(iso).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 172800) return 'вчера';
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function groupByDate(items: NotificationItem[]): { label: string; items: NotificationItem[] }[] {
  const groups = new Map<string, NotificationItem[]>();

  for (const item of items) {
    const date = new Date(item.createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let label: string;
    if (itemDay.getTime() === today.getTime()) {
      label = 'Сегодня';
    } else if (itemDay.getTime() === yesterday.getTime()) {
      label = 'Вчера';
    } else {
      label = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }

    const arr = groups.get(label) ?? [];
    arr.push(item);
    groups.set(label, arr);
  }

  return Array.from(groups, ([label, items]) => ({ label, items }));
}

/** Map notification type → icon component & style */
function getIconProps(type: NotificationType): { Icon: typeof Bell; cls: string } {
  switch (type) {
    case 'deal_request':
    case 'deal_confirmed':
    case 'deal_started':
    case 'deal_ending':
    case 'deal_completed':
    case 'deal_cancelled':
    case 'deal_rejected':
      return { Icon: Calendar, cls: styles.iconDeal };
    case 'payment_received':
    case 'deposit_returned':
      return { Icon: Wallet, cls: styles.iconPayment };
    case 'payment_sent':
    case 'deposit_held':
      return { Icon: CreditCard, cls: styles.iconPayment };
    case 'review_received':
      return { Icon: Star, cls: styles.iconReview };
    case 'review_reminder':
      return { Icon: Bookmark, cls: styles.iconReview };
    case 'message_new':
    case 'message_mention':
      return { Icon: MessageSquare, cls: styles.iconMessage };
    case 'verification':
      return { Icon: Shield, cls: styles.iconSystem };
    case 'security':
      return { Icon: Lock, cls: styles.iconSecurity };
    case 'promo':
      return { Icon: Gift, cls: styles.iconPromo };
    case 'system':
    default:
      return { Icon: Bell, cls: styles.iconSystem };
  }
}

const DEAL_STATUS_CLS: Record<string, string> = {
  new: styles.statusNew,
  confirmed: styles.statusConfirmed,
  active: styles.statusActive,
  completed: styles.statusCompleted,
  rejected: styles.statusRejected,
};

const DEAL_STATUS_LABEL: Record<string, string> = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  active: 'Активна',
  completed: 'Завершена',
  rejected: 'Отклонена',
};

/* ═══════════════════════════════════════════════════════════════════════════════
   NotificationsPage
   ═══════════════════════════════════════════════════════════════════════════════ */

export function NotificationsPage() {
  const [tab, setTab] = useState<NotificationTab>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const filtered = useMemo(() => {
    const types = TAB_TYPE_MAP[tab];
    const list = tab === 'all'
      ? notifications
      : notifications.filter((n) => types.includes(n.type));
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [notifications, tab]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  const totalUnread = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const tabCounts = useMemo(() => {
    const counts: Record<NotificationTab, number> = {
      all: 0, deals: 0, payments: 0, messages: 0, reviews: 0, system: 0,
    };
    for (const n of notifications) {
      if (!n.isRead) {
        counts.all++;
        for (const [key, types] of Object.entries(TAB_TYPE_MAP)) {
          if (key !== 'all' && types.includes(n.type)) {
            counts[key as NotificationTab]++;
          }
        }
      }
    }
    return counts;
  }, [notifications]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ─── Header ─── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link href="/dev-ui" className={styles.backBtn} aria-label="Назад">
              <ArrowLeft />
            </Link>
            <h1 className={styles.title}>
              Уведомления
              {totalUnread > 0 && (
                <span className={styles.unreadBadge}>{totalUnread}</span>
              )}
            </h1>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.markReadBtn}
              onClick={handleMarkAllRead}
              disabled={totalUnread === 0}
            >
              <CheckCheck size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
              Прочитать все
            </button>
            <Link href="/dev-ui/settings" className={styles.settingsBtn} aria-label="Настройки уведомлений">
              <Settings />
            </Link>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className={styles.tabs}>
          {(Object.keys(NOTIFICATION_TAB_LABELS) as NotificationTab[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {NOTIFICATION_TAB_LABELS[t]}
              {tabCounts[t] > 0 && (
                <span className={`${styles.tabBadge} ${tab === t ? styles.tabBadgeActive : ''}`}>
                  {tabCounts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Notification List ─── */}
        {groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.label} className={styles.dateGroup}>
              <h3 className={styles.dateLabel}>{group.label}</h3>
              {group.items.map((ntf) => (
                <NotificationCard
                  key={ntf.id}
                  notification={ntf}
                  onRead={handleMarkRead}
                />
              ))}
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><BellOff /></div>
            <h3 className={styles.emptyTitle}>Нет уведомлений</h3>
            <p className={styles.emptyText}>
              {tab === 'all'
                ? 'У вас пока нет уведомлений. Они появятся, когда начнётся активность.'
                : 'В этой категории нет уведомлений.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ NotificationCard ═══ */

function NotificationCard({
  notification: ntf,
  onRead,
}: {
  notification: NotificationItem;
  onRead: (id: string) => void;
}) {
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
      className={`${styles.card} ${!ntf.isRead ? styles.cardUnread : ''} ${priorityCls}`}
      onClick={handleClick}
    >
      <div className={`${styles.iconCircle} ${iconCls}`}>
        <Icon />
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <h4 className={`${styles.cardTitle} ${!ntf.isRead ? styles.cardTitleUnread : ''}`}>
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
              className={`${styles.cardAmount} ${
                ntf.type === 'payment_received' || ntf.type === 'deposit_returned'
                  ? styles.cardAmountPositive
                  : ntf.type === 'payment_sent' || ntf.type === 'deposit_held'
                    ? styles.cardAmountNegative
                    : ''
              }`}
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
          <span className={`${styles.statusBadge} ${DEAL_STATUS_CLS[ntf.meta.dealStatus] ?? ''}`}>
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
      <Link href={ntf.actionUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
        {card}
      </Link>
    );
  }

  return card;
}
