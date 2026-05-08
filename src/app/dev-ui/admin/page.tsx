'use client';

import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Handshake,
  Banknote,
  Settings,
} from 'lucide-react';
import { AdminLayout } from '@/ux/layouts/AdminLayout';
import type { NavSection } from '@/ux/layouts/AdminLayout';
import { AdminPanel } from '@/ux/features';

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
      { key: 'settings', label: 'Настройки', icon: Settings, href: '/dev-ui/admin' },
    ],
  },
];

export default function AdminPage() {
  return (
    <AdminLayout
      sections={ADMIN_SECTIONS}
      brandLabel="Панель администратора"
      userName="Администратор"
      userRole="admin"
      pageTitle="Панель администратора"
    >
      <AdminPanel />
    </AdminLayout>
  );
}
