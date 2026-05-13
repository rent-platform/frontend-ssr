'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { getInitials } from '@/ux/utils';
import s from './AdminLayout.module.scss';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SearchModal } from './SearchModal';
import type { AdminLayoutProps } from './types';

export type { NavItem, NavSection, AdminLayoutProps } from './types';

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const initials = getInitials(userName);

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
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={s.layout}>
      {/* Mobile overlay */}
      <div
        className={clsx(s.sidebarOverlay, sidebarOpen && s.overlayVisible)}
        onClick={closeSidebar}
      />

      <Sidebar
        sections={sections}
        activeKey={activeKey}
        brandLabel={brandLabel}
        userName={userName}
        userRole={userRole}
        initials={initials}
        sidebarOpen={sidebarOpen}
        onClose={closeSidebar}
        onNavClick={onNavClick}
      />

      <div className={s.main}>
        <Topbar
          brandLabel={brandLabel}
          resolvedTitle={resolvedTitle}
          sectionTitle={activeSection?.title}
          unreadCount={unreadCount}
          notifications={notifications}
          onMenuOpen={() => setSidebarOpen(true)}
          onSearchOpen={() => { setSearchOpen(true); setSearchQuery(''); }}
        />

        <main className={s.content}>{children}</main>
      </div>

      <SearchModal
        open={searchOpen}
        query={searchQuery}
        results={searchResults}
        onClose={() => setSearchOpen(false)}
        onQueryChange={setSearchQuery}
        onNavClick={onNavClick}
      />
    </div>
  );
}
