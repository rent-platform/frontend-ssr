'use client';

import {
  ShieldCheck,
  Flag,
  MessageSquare,
} from 'lucide-react';
import { AdminLayout } from '@/ux/layouts/AdminLayout';
import type { NavSection } from '@/ux/layouts/AdminLayout';
import { ModeratorPanel } from '@/ux/features';

const MODERATOR_SECTIONS: NavSection[] = [
  {
    title: 'Модерация',
    items: [
      { key: 'queue', label: 'Очередь модерации', icon: ShieldCheck, href: '/dev-ui/moderator', badge: 5 },
      { key: 'complaints', label: 'Жалобы', icon: Flag, href: '/dev-ui/moderator', badge: 3 },
      { key: 'reviews', label: 'Отзывы', icon: MessageSquare, href: '/dev-ui/moderator' },
    ],
  },
];

export default function ModeratorPage() {
  return (
    <AdminLayout
      sections={MODERATOR_SECTIONS}
      brandLabel="Панель модератора"
      userName="Дмитрий Козлов"
      userRole="moderator"
      pageTitle="Панель модератора"
    >
      <ModeratorPanel />
    </AdminLayout>
  );
}
