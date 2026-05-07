'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, CreditCard, Lock, Shield, User } from 'lucide-react';
import type { SettingsTab } from './types';
import clsx from 'clsx';
import { ROUTES } from '@/ux/utils';
import { ProfileSection } from './components/ProfileSection';
import { SecuritySection } from './components/SecuritySection';
import { NotificationsSection } from './components/NotificationsSection';
import { PaymentSection } from './components/PaymentSection';
import { PrivacySection } from './components/PrivacySection';
import styles from './SettingsPage.module.scss';

/* ─── Sidebar items ─── */

const SIDEBAR_ITEMS: { tab: SettingsTab; icon: React.ReactNode; label: string }[] = [
  { tab: 'profile', icon: <User size={18} />, label: 'Личные данные' },
  { tab: 'security', icon: <Lock size={18} />, label: 'Вход и безопасность' },
  { tab: 'notifications', icon: <Bell size={18} />, label: 'Уведомления' },
  { tab: 'payment', icon: <CreditCard size={18} />, label: 'Способы оплаты' },
  { tab: 'privacy', icon: <Shield size={18} />, label: 'Конфиденциальность' },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   SettingsPage
   ═══════════════════════════════════════════════════════════════════════════════ */
export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile');

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href={ROUTES.profile} className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Назад в профиль</span>
        </Link>

        <h1 className={styles.pageTitle}>Настройки</h1>
        <p className={styles.pageSubtitle}>Управляйте своим аккаунтом и предпочтениями</p>

        <div className={styles.layout}>
          {/* ── Sidebar ── */}
          <nav className={styles.sidebar}>
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.tab}
                type="button"
                className={clsx(styles.sidebarItem, tab === item.tab && styles.sidebarItemActive)}
                onClick={() => setTab(item.tab)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* ── Content ── */}
          <div>
            {tab === 'profile' && <ProfileSection />}
            {tab === 'security' && <SecuritySection />}
            {tab === 'notifications' && <NotificationsSection />}
            {tab === 'payment' && <PaymentSection />}
            {tab === 'privacy' && <PrivacySection />}
          </div>
        </div>
      </div>
    </div>
  );
}
