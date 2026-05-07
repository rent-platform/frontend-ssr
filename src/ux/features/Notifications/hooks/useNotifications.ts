import { useEffect, useMemo, useState, useCallback } from 'react';
import type { NotificationItem, NotificationTab } from '../types';
import { TAB_TYPE_MAP } from '../types';
import { MOCK_NOTIFICATIONS } from '../mockNotifications';
import { groupByDate } from '../components/notificationHelpers';

export type UseNotificationsOptions = {
  notifications?: NotificationItem[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
};

export function useNotifications({
  notifications: externalNotifications,
  onMarkRead,
  onMarkAllRead,
}: UseNotificationsOptions = {}) {
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

  return {
    tab,
    setTab,
    groups,
    totalUnread,
    tabCounts,
    handleMarkAllRead,
    handleMarkRead,
  };
}
