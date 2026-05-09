import {
  Ban,
  Bell,
  Bookmark,
  Calendar,
  CheckCircle,
  CircleCheckBig,
  ClipboardList,
  Clock,
  CreditCard,
  Gift,
  Inbox,
  Lock,
  MessageCircle,
  MessageSquare,
  Play,
  Shield,
  Star,
  Wallet,
  XCircle,
} from 'lucide-react';
import type { NotificationItem, NotificationTab, NotificationType } from '../types';
import styles from '../NotificationsPage.module.scss';

export function groupByDate(items: NotificationItem[]): { label: string; items: NotificationItem[] }[] {
  const groups = new Map<string, NotificationItem[]>();

  for (const item of items) {
    const date = new Date(item.createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let label: string;
    if (itemDay.getTime() === today.getTime()) {
      label = 'Сегодня';
    } else if (itemDay.getTime() === yesterday.getTime()) {
      label = 'Вчера';
    } else {
      label = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }

    const arr = groups.get(label) ?? [];
    arr.push(item);
    groups.set(label, arr);
  }

  return Array.from(groups, ([label, items]) => ({ label, items }));
}

/** Map notification type → icon component & style */
export function getIconProps(type: NotificationType): { Icon: typeof Bell; cls: string } {
  switch (type) {
    case 'deal_request':
      return { Icon: ClipboardList, cls: styles.iconDealRequest };
    case 'deal_confirmed':
      return { Icon: CheckCircle, cls: styles.iconDealConfirmed };
    case 'deal_started':
      return { Icon: Play, cls: styles.iconDealActive };
    case 'deal_ending':
      return { Icon: Clock, cls: styles.iconDealEnding };
    case 'deal_completed':
      return { Icon: CircleCheckBig, cls: styles.iconDealCompleted };
    case 'deal_cancelled':
      return { Icon: Ban, cls: styles.iconDealRejected };
    case 'deal_rejected':
      return { Icon: XCircle, cls: styles.iconDealRejected };
    case 'payment_received':
    case 'deposit_returned':
      return { Icon: Wallet, cls: styles.iconPayment };
    case 'payment_sent':
    case 'deposit_held':
      return { Icon: CreditCard, cls: styles.iconPayment };
    case 'review_received':
      return { Icon: Star, cls: styles.iconReview };
    case 'review_reminder':
      return { Icon: Bookmark, cls: styles.iconReview };
    case 'message_new':
    case 'message_mention':
      return { Icon: MessageSquare, cls: styles.iconMessage };
    case 'verification':
      return { Icon: Shield, cls: styles.iconSystem };
    case 'security':
      return { Icon: Lock, cls: styles.iconSecurity };
    case 'promo':
      return { Icon: Gift, cls: styles.iconPromo };
    case 'system':
    default:
      return { Icon: Bell, cls: styles.iconSystem };
  }
}

export const DEAL_STATUS_CLS: Record<string, string> = {
  PENDING: styles.statusNew,
  CONFIRMED: styles.statusConfirmed,
  ACTIVE: styles.statusActive,
  COMPLETED: styles.statusCompleted,
  REJECTED: styles.statusRejected,
};

export const DEAL_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Новая',
  CONFIRMED: 'Подтверждена',
  ACTIVE: 'Активна',
  COMPLETED: 'Завершена',
  REJECTED: 'Отклонена',
};

/* ─── Tab configuration for flat pill tabs ─── */

export const TAB_CONFIG: { key: NotificationTab; label: string; Icon: typeof Bell }[] = [
  { key: 'all', label: 'Все', Icon: Inbox },
  { key: 'deals', label: 'Сделки', Icon: Calendar },
  { key: 'payments', label: 'Платежи', Icon: Wallet },
  { key: 'messages', label: 'Сообщения', Icon: MessageCircle },
  { key: 'reviews', label: 'Отзывы', Icon: Star },
  { key: 'system', label: 'Система', Icon: Shield },
];

/* ─── Avatar color from counterparty name ─── */

const AVATAR_COLORS = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899',
  '#06b6d4', '#f97316', '#14b8a6', '#6366f1', '#e11d48',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ─── Tab-specific empty states ─── */

export const TAB_EMPTY_STATE: Record<NotificationTab, { title: string; text: string }> = {
  all: {
    title: 'Нет уведомлений',
    text: 'У вас пока нет уведомлений. Они появятся, когда начнётся активность.',
  },
  deals: {
    title: 'Нет уведомлений о сделках',
    text: 'Здесь будут уведомления о заявках на аренду, подтверждениях и завершениях сделок.',
  },
  payments: {
    title: 'Нет уведомлений о платежах',
    text: 'Здесь будут уведомления об оплатах, залогах и возвратах.',
  },
  messages: {
    title: 'Нет новых сообщений',
    text: 'Здесь появятся уведомления о входящих сообщениях и упоминаниях.',
  },
  reviews: {
    title: 'Нет уведомлений об отзывах',
    text: 'Здесь будут уведомления о новых отзывах и напоминания оставить свой.',
  },
  system: {
    title: 'Нет системных уведомлений',
    text: 'Здесь будут важные уведомления о безопасности, верификации и обновлениях.',
  },
};
