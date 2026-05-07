import {
  Bell,
  Bookmark,
  Calendar,
  CreditCard,
  Gift,
  Lock,
  MessageSquare,
  Shield,
  Star,
  Wallet,
} from 'lucide-react';
import type { NotificationItem, NotificationType } from '../types';
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
    case 'deal_confirmed':
    case 'deal_started':
    case 'deal_ending':
    case 'deal_completed':
    case 'deal_cancelled':
    case 'deal_rejected':
      return { Icon: Calendar, cls: styles.iconDeal };
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
