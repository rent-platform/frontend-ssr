'use client';

import { useState, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Handshake,
  Banknote,
  Settings,
  Activity,
} from 'lucide-react';
import { AdminLayout } from '@/ux/layouts/AdminLayout';
import type { NavSection } from '@/ux/layouts/AdminLayout';
import { AdminPanel } from '@/ux/features';
import type { AdminTab } from '@/ux/features/Admin/types';
import { mockAdminNotifications } from '@/ux/features/Admin/mockAdminData';

const ADMIN_SECTIONS: NavSection[] = [
  {
    title: 'Основное',
    items: [
      { key: 'dashboard', label: 'Дашборд', icon: LayoutDashboard, href: '/dev-ui/admin' },
    ],
  },
  {
    title: 'Управление',
    items: [
      { key: 'users', label: 'Пользователи', icon: Users, href: '/dev-ui/admin', badge: 8 },
      { key: 'listings', label: 'Объявления', icon: ShoppingBag, href: '/dev-ui/admin' },
      { key: 'deals', label: 'Сделки', icon: Handshake, href: '/dev-ui/admin' },
    ],
  },
  {
    title: 'Система',
    items: [
      { key: 'finance', label: 'Финансы', icon: Banknote, href: '/dev-ui/admin' },
      { key: 'activity', label: 'Журнал действий', icon: Activity, href: '/dev-ui/admin' },
      { key: 'settings', label: 'Настройки', icon: Settings, href: '/dev-ui/admin' },
    ],
  },
];

const notifications = mockAdminNotifications.map((n) => ({
  id: n.id,
  title: n.title,
  message: n.message,
  read: n.read,
  createdAt: n.createdAt,
}));

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const handleNavClick = useCallback((key: string) => {
    setActiveTab(key as AdminTab);
  }, []);

  return (
    <AdminLayout
      sections={ADMIN_SECTIONS}
      brandLabel="Панель администратора"
      userName="Администратор"
      userRole="admin"
      activeNavKey={activeTab}
      onNavClick={handleNavClick}
      notifications={notifications}
    >
      <AdminPanel activeTab={activeTab} />
    </AdminLayout>
  );
}
