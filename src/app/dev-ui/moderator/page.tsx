'use client';

import { useState, useCallback } from 'react';
import {
  ShieldCheck,
  Flag,
  MessageSquare,
  ClipboardList,
} from 'lucide-react';
import { AdminLayout } from '@/ux/layouts/AdminLayout';
import type { NavSection } from '@/ux/layouts/AdminLayout';
import { ModeratorPanel } from '@/ux/features';
import type { ModeratorTab } from '@/ux/features/Moderator/types';

const MODERATOR_SECTIONS: NavSection[] = [
  {
    title: 'Модерация',
    items: [
      { key: 'queue', label: 'Очередь модерации', icon: ShieldCheck, href: '/dev-ui/moderator', badge: 5 },
      { key: 'complaints', label: 'Жалобы', icon: Flag, href: '/dev-ui/moderator', badge: 3 },
      { key: 'reviews', label: 'Отзывы', icon: MessageSquare, href: '/dev-ui/moderator' },
      { key: 'activity', label: 'Журнал действий', icon: ClipboardList, href: '/dev-ui/moderator' },
    ],
  },
];

export default function ModeratorPage() {
  const [activeTab, setActiveTab] = useState<ModeratorTab>('queue');

  const handleNavClick = useCallback((key: string) => {
    setActiveTab(key as ModeratorTab);
  }, []);

  return (
    <AdminLayout
      sections={MODERATOR_SECTIONS}
      brandLabel="Панель модератора"
      userName="Дмитрий Козлов"
      userRole="moderator"
      activeNavKey={activeTab}
      onNavClick={handleNavClick}
    >
      <ModeratorPanel activeTab={activeTab} />
    </AdminLayout>
  );
}
