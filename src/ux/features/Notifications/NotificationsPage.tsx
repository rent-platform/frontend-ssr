'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BellOff,
  CheckCheck,
  ChevronDown,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';
import type {
  NotificationItem,
  NotificationTab,
} from './types';
import {
  NOTIFICATION_TAB_LABELS,
  TAB_TYPE_MAP,
} from './types';
import { MOCK_NOTIFICATIONS } from './mockNotifications';
import { ROUTES } from '@/ux/utils';
import { groupByDate } from './components/notificationHelpers';
import { NotificationCard } from './components/NotificationCard';
import styles from './NotificationsPage.module.scss';

/* ═══════════════════════════════════════════════════════════════════════════════
   NotificationsPage
   ═══════════════════════════════════════════════════════════════════════════════ */

export type NotificationsPageProps = {
  /** Notifications from API. Falls back to mock data. */
  notifications?: NotificationItem[];
  /** True while loading from API. */
  isLoading?: boolean;
  /** Called when a notification is marked as read. */
  onMarkRead?: (id: string) => void;
  /** Called when all notifications are marked as read. */
  onMarkAllRead?: () => void;
};

export function NotificationsPage({
  notifications: externalNotifications,
  isLoading: externalLoading,
  onMarkRead,
  onMarkAllRead,
}: NotificationsPageProps = {}) {
  const [tab, setTab] = useState<NotificationTab>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    externalNotifications ?? MOCK_NOTIFICATIONS,
  );

  useEffect(() => {
    if (externalNotifications) setNotifications(externalNotifications);
  }, [externalNotifications]);

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
    onMarkAllRead?.();
  }, [onMarkAllRead]);

  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    onMarkRead?.(id);
  }, [onMarkRead]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ─── Header ─── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link href={ROUTES.home} className={styles.backBtn} aria-label="Назад">
              <ArrowLeft />
            </Link>
            <h1 className={styles.title}>
              Уведомления
              {totalUnread > 0 && (
                <span className={styles.unreadBadge} aria-live="polite" aria-label={`${totalUnread} непрочитанных`}>{totalUnread}</span>
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
              <CheckCheck size={14} className="inlineIcon" />
              Прочитать все
            </button>
            <Link href={ROUTES.settings} className={styles.settingsBtn} aria-label="Настройки уведомлений">
              <Settings />
            </Link>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={clsx(styles.tab, tab === 'all' && styles.tabActive)}
            onClick={() => setTab('all')}
          >
            Все
            {tabCounts.all > 0 && (
              <span className={clsx(styles.tabBadge, tab === 'all' && styles.tabBadgeActive)}>
                {tabCounts.all}
              </span>
            )}
          </button>

          <div className={styles.dropdownWrap}>
            <button
              type="button"
              className={clsx(styles.tab, tab !== 'all' && styles.tabActive)}
            >
              {tab !== 'all' ? NOTIFICATION_TAB_LABELS[tab] : 'Категория'}
              {tab !== 'all' && tabCounts[tab] > 0 && (
                <span className={clsx(styles.tabBadge, styles.tabBadgeActive)}>
                  {tabCounts[tab]}
                </span>
              )}
              <ChevronDown size={14} className={styles.dropdownChevron} />
            </button>
            <div className={styles.dropdown}>
              {(Object.keys(NOTIFICATION_TAB_LABELS) as NotificationTab[])
                .filter((t) => t !== 'all')
                .map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={clsx(styles.dropdownItem, tab === t && styles.dropdownItemActive)}
                    onClick={() => setTab(t)}
                  >
                    <span>{NOTIFICATION_TAB_LABELS[t]}</span>
                    {tabCounts[t] > 0 && (
                      <span className={styles.dropdownItemBadge}>{tabCounts[t]}</span>
                    )}
                  </button>
                ))}
            </div>
          </div>
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
