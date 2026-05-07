'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  BellOff,
  CheckCheck,
  ChevronDown,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';
import type { NotificationItem, NotificationTab } from './types';
import { NOTIFICATION_TAB_LABELS } from './types';
import { ROUTES } from '@/ux/utils';
import { NotificationCard } from './components/NotificationCard';
import { useNotifications } from './hooks/useNotifications';
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
  isLoading: _externalLoading,
  onMarkRead,
  onMarkAllRead,
}: NotificationsPageProps = {}) {
  const {
    tab,
    setTab,
    groups,
    totalUnread,
    tabCounts,
    handleMarkAllRead,
    handleMarkRead,
  } = useNotifications({
    notifications: externalNotifications,
    onMarkRead,
    onMarkAllRead,
  });

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
