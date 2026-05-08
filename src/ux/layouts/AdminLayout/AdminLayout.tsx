'use client';

import { type ReactNode, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import s from './AdminLayout.module.scss';

export type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: number;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export type AdminLayoutProps = {
  children: ReactNode;
  sections: NavSection[];
  brandLabel: string;
  userName: string;
  userRole: string;
  pageTitle?: string;
  notifications?: { id: string; title: string; message: string; read: boolean; createdAt: string }[];
  activeNavKey?: string;
  onNavClick?: (key: string) => void;
};

export function AdminLayout({
  children,
  sections,
  brandLabel,
  userName,
  userRole,
  pageTitle,
  notifications = [],
  activeNavKey,
  onNavClick,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const activeKey =
    activeNavKey ??
    sections
      .flatMap((sec) => sec.items)
      .find((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
      ?.key ?? '';

  const activeItem = sections.flatMap((sec) => sec.items).find((i) => i.key === activeKey);
  const activeSection = sections.find((sec) => sec.items.some((i) => i.key === activeKey));

  const resolvedTitle = pageTitle ?? activeItem?.label ?? '';

  const initials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const allNavItems = useMemo(
    () => sections.flatMap((sec) => sec.items),
    [sections],
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return allNavItems;
    const q = searchQuery.toLowerCase();
    return allNavItems.filter((item) => item.label.toLowerCase().includes(q));
  }, [searchQuery, allNavItems]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setSearchQuery('');
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

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

  return (
    <div className={s.layout}>
      {/* Mobile overlay */}
      <div
        className={clsx(s.sidebarOverlay, sidebarOpen && s.overlayVisible)}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={clsx(s.sidebar, sidebarOpen && s.sidebarOpen)}>
        <div className={s.brand}>
          <span className={s.brandIcon}>А</span>
          <div className={s.brandText}>
            <span className={s.brandName}>Арендай</span>
            <span className={s.brandRole}>{brandLabel}</span>
          </div>
          <button
            className={clsx(s.btn, s.btnGhost, s.btnSm)}
            onClick={closeSidebar}
            style={{ marginLeft: 'auto', display: sidebarOpen ? undefined : 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className={s.nav}>
          {sections.map((section, idx) => (
            <div key={idx} className={s.navSection}>
              {section.title && (
                <div className={s.navSectionLabel}>{section.title}</div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.key === activeKey;
                if (onNavClick) {
                  return (
                    <button
                      key={item.key}
                      className={clsx(s.navItem, isActive && s.navItemActive)}
                      onClick={() => { onNavClick(item.key); closeSidebar(); }}
                    >
                      <span className={s.navItemIcon}>
                        <Icon size={18} />
                      </span>
                      {item.label}
                      {item.badge != null && item.badge > 0 && (
                        <span className={s.navItemBadge}>{item.badge}</span>
                      )}
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={clsx(s.navItem, isActive && s.navItemActive)}
                    onClick={closeSidebar}
                  >
                    <span className={s.navItemIcon}>
                      <Icon size={18} />
                    </span>
                    {item.label}
                    {item.badge != null && item.badge > 0 && (
                      <span className={s.navItemBadge}>{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={s.sidebarFooter}>
          <div className={s.userCard}>
            <div className={s.userAvatar}>{initials}</div>
            <div className={s.userInfo}>
              <div className={s.userName}>{userName}</div>
              <div className={s.userRole}>{userRole}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className={s.main}>
        <header className={s.topbar}>
          <button
            className={s.menuBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label="Открыть меню"
          >
            <Menu size={22} />
          </button>

          {/* Breadcrumbs */}
          <div className={s.breadcrumbs}>
            <span className={s.breadcrumbItem}>{brandLabel}</span>
            {activeSection?.title && (
              <>
                <ChevronRight size={14} className={s.breadcrumbSep} />
                <span className={s.breadcrumbItem}>{activeSection.title}</span>
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
              onClick={() => { setSearchOpen(true); setSearchQuery(''); }}
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

        <main className={s.content}>{children}</main>
      </div>

      {/* Search modal (Ctrl+K) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className={s.searchModalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              className={s.searchModal}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={s.searchModalInput}>
                <Search size={18} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Поиск по разделам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <kbd className={s.kbdHint}>Esc</kbd>
              </div>
              <div className={s.searchModalResults}>
                {searchResults.length === 0 ? (
                  <div className={s.searchModalEmpty}>Ничего не найдено</div>
                ) : (
                  searchResults.map((item) => {
                    const Icon = item.icon;
                    if (onNavClick) {
                      return (
                        <button
                          key={item.key}
                          className={s.searchModalItem}
                          onClick={() => { onNavClick(item.key); setSearchOpen(false); }}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </button>
                      );
                    }
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        className={s.searchModalItem}
                        onClick={() => setSearchOpen(false)}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
