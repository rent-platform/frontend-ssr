'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import clsx from 'clsx';
import s from './AdminLayout.module.scss';
import type { NavSection } from './types';

type SidebarProps = {
  sections: NavSection[];
  activeKey: string;
  brandLabel: string;
  userName: string;
  userRole: string;
  initials: string;
  sidebarOpen: boolean;
  onClose: () => void;
  onNavClick?: (key: string) => void;
};

export function Sidebar({
  sections,
  activeKey,
  brandLabel,
  userName,
  userRole,
  initials,
  sidebarOpen,
  onClose,
  onNavClick,
}: SidebarProps) {
  return (
    <aside className={clsx(s.sidebar, sidebarOpen && s.sidebarOpen)}>
      <div className={s.brand}>
        <span className={s.brandIcon}>А</span>
        <div className={s.brandText}>
          <span className={s.brandName}>Арендай</span>
          <span className={s.brandRole}>{brandLabel}</span>
        </div>
        <button
          className={clsx(s.btn, s.btnGhost, s.btnSm)}
          onClick={onClose}
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
                    onClick={() => { onNavClick(item.key); onClose(); }}
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
                  onClick={onClose}
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
  );
}
