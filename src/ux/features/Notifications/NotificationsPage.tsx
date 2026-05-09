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
import { AnimatePresence, motion } from 'framer-motion';
import type { NotificationItem } from './types';
import { ROUTES } from '@/ux/utils';
import { NotificationCard } from './components/NotificationCard';
import { useNotifications } from './hooks/useNotifications';
import { TAB_CONFIG, TAB_EMPTY_STATE } from './components/notificationHelpers';
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
              {tab !== 'all'
                ? TAB_CONFIG.find((t) => t.key === tab)!.label
                : 'Категория'}
              {tab !== 'all' && tabCounts[tab] > 0 && (
                <span className={clsx(styles.tabBadge, styles.tabBadgeActive)}>
                  {tabCounts[tab]}
                </span>
              )}
              <ChevronDown size={14} className={styles.dropdownChevron} />
            </button>
            <div className={styles.dropdown}>
              {TAB_CONFIG.filter((t) => t.key !== 'all').map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={clsx(styles.dropdownItem, tab === key && styles.dropdownItemActive)}
                  onClick={() => setTab(key)}
                >
                  <span className={styles.dropdownItemLeft}>
                    <Icon size={15} />
                    {label}
                  </span>
                  {tabCounts[key] > 0 && (
                    <span className={styles.dropdownItemBadge}>{tabCounts[key]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Notification List ─── */}
        <AnimatePresence mode="wait">
          {groups.length > 0 ? (
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {groups.map((group) => (
                <div key={group.label} className={styles.dateGroup}>
                  <h3 className={styles.dateLabel}>{group.label}</h3>
                  {group.items.map((ntf, i) => (
                    <motion.div
                      key={ntf.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                    >
                      <NotificationCard
                        notification={ntf}
                        onRead={handleMarkRead}
                      />
                    </motion.div>
                  ))}
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${tab}`}
              className={styles.emptyState}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.emptyIcon}><BellOff /></div>
              <h3 className={styles.emptyTitle}>{TAB_EMPTY_STATE[tab].title}</h3>
              <p className={styles.emptyText}>{TAB_EMPTY_STATE[tab].text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
