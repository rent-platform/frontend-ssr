import type { DealStatus } from '@/business/types/entity';

/* ─── Notification categories ─── */

export type NotificationType =
  | 'deal_request'      // Новая заявка на аренду
  | 'deal_confirmed'    // Заявка подтверждена
  | 'deal_rejected'     // Заявка отклонена
  | 'deal_started'      // Аренда началась
  | 'deal_ending'       // Аренда скоро заканчивается
  | 'deal_completed'    // Аренда завершена
  | 'deal_cancelled'    // Аренда отменена
  | 'payment_received'  // Оплата получена
  | 'payment_sent'      // Оплата отправлена
  | 'deposit_held'      // Залог удержан
  | 'deposit_returned'  // Залог возвращён
  | 'review_received'   // Новый отзыв получен
  | 'review_reminder'   // Напоминание оставить отзыв
  | 'message_new'       // Новое сообщение
  | 'message_mention'   // Упоминание в чате
  | 'verification'      // Подтверждение аккаунта / документов
  | 'promo'             // Акции, бонусы
  | 'system'            // Системные уведомления
  | 'security';         // Безопасность (вход, смена пароля)

/* ─── Notification priority ─── */

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/* ─── Notification Item ─── */

export interface NotificationItem {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  createdAt: string;         // ISO
  isRead: boolean;
  /** Navigation target when clicked */
  actionUrl?: string;
  /** CTA button label */
  actionLabel?: string;
  /** Related item image */
  image?: string | null;
  /** Related entity context */
  meta?: {
    itemTitle?: string;
    counterpartyName?: string;
    counterpartyAvatar?: string;
    dealStatus?: DealStatus;
    amount?: number;
    currency?: string;
    rating?: number;
  };
}

/* ─── Filter tabs ─── */

export type NotificationTab = 'all' | 'deals' | 'payments' | 'messages' | 'reviews' | 'system';

export const NOTIFICATION_TAB_LABELS: Record<NotificationTab, string> = {
  all: 'Все',
  deals: 'Сделки',
  payments: 'Платежи',
  messages: 'Сообщения',
  reviews: 'Отзывы',
  system: 'Система',
};

/** Which notification types fall into which tab */
export const TAB_TYPE_MAP: Record<NotificationTab, NotificationType[]> = {
  all: [],
  deals: [
    'deal_request', 'deal_confirmed', 'deal_rejected',
    'deal_started', 'deal_ending', 'deal_completed', 'deal_cancelled',
  ],
  payments: ['payment_received', 'payment_sent', 'deposit_held', 'deposit_returned'],
  messages: ['message_new', 'message_mention'],
  reviews: ['review_received', 'review_reminder'],
  system: ['verification', 'promo', 'system', 'security'],
};
