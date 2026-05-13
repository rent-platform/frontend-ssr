'use client';

import { useRef, useEffect, useState } from 'react';
import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import s from './AdminLayout.module.scss';
import type { Notification } from './types';

type TopbarProps = {
  brandLabel: string;
  resolvedTitle: string;
  sectionTitle?: string;
  unreadCount: number;
  notifications: Notification[];
  onMenuOpen: () => void;
  onSearchOpen: () => void;
};

export function Topbar({
  brandLabel,
  resolvedTitle,
  sectionTitle,
  unreadCount,
  notifications,
  onMenuOpen,
  onSearchOpen,
}: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [notifOpen]);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setNotifOpen(false);
    }
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <header className={s.topbar}>
      <button
        className={s.menuBtn}
        onClick={onMenuOpen}
        aria-label="Открыть меню"
      >
        <Menu size={22} />
      </button>

      {/* Breadcrumbs */}
      <div className={s.breadcrumbs}>
        <span className={s.breadcrumbItem}>{brandLabel}</span>
        {sectionTitle && (
          <>
            <ChevronRight size={14} className={s.breadcrumbSep} />
            <span className={s.breadcrumbItem}>{sectionTitle}</span>
          </>
        )}
        {resolvedTitle && (
          <>
            <ChevronRight size={14} className={s.breadcrumbSep} />
            <span className={clsx(s.breadcrumbItem, s.breadcrumbActive)}>
              {resolvedTitle}
            </span>
          </>
        )}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Search trigger */}
        <button
          className={clsx(s.btn, s.btnGhost, s.btnSm)}
          onClick={onSearchOpen}
          title="Поиск (Ctrl+K)"
        >
          <Search size={18} />
          <kbd className={s.kbdHint}>Ctrl+K</kbd>
        </button>

        {/* Notifications */}
        <div className={s.notifWrapper} ref={notifRef}>
          <button
            className={clsx(s.btn, s.btnGhost, s.btnSm, s.notifBtn)}
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className={s.notifDot}>{unreadCount}</span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                className={s.notifDropdown}
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <div className={s.notifHeader}>
                  <span className={s.notifTitle}>Уведомления</span>
                  {unreadCount > 0 && (
                    <span className={s.notifCount}>{unreadCount} новых</span>
                  )}
                </div>
                <div className={s.notifList}>
                  {notifications.length === 0 ? (
                    <div className={s.notifEmpty}>Нет уведомлений</div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        className={clsx(s.notifItem, !n.read && s.notifItemUnread)}
                      >
                        <div className={s.notifItemTitle}>{n.title}</div>
                        <div className={s.notifItemMessage}>{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
