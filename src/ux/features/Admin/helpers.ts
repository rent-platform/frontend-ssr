import s from '../../layouts/AdminLayout/AdminLayout.module.scss';
import type { ItemStatus } from '@/business/ads';
import type { UiDealStatus } from '@/ux/types';
import type { PaymentStatus } from '@/business/payments';
import type { UserRole } from '@/business/auth';

/* ── Format helpers (re-exported from @/ux/utils) ──────────────────────── */

export {
  formatDate,
  formatDateTime,
  formatPriceNum as formatPrice,
  formatMoney,
} from '@/ux/utils';

/* ── Status maps ────────────────────────────────────────────────────────── */

export const ITEM_STATUS_MAP: Record<ItemStatus, { label: string; cls: string }> = {
  DRAFT: { label: 'Черновик', cls: s.badgeGray },
  MODERATION: { label: 'Модерация', cls: s.badgeOrange },
  ACTIVE: { label: 'Активно', cls: s.badgeGreen },
  REJECTED: { label: 'Отклонено', cls: s.badgeRed },
  ARCHIVED: { label: 'Архив', cls: s.badgeGray },
};

export const DEAL_STATUS_MAP: Record<UiDealStatus, { label: string; cls: string }> = {
  PENDING: { label: 'Ожидание', cls: s.badgeOrange },
  CONFIRMED: { label: 'Подтверждена', cls: s.badgeBlue },
  AWAITING_PAYMENT: { label: 'Ожидает оплаты', cls: s.badgePurple },
  ACTIVE: { label: 'В аренде', cls: s.badgeGreen },
  COMPLETED: { label: 'Завершена', cls: s.badgeGreen },
  REJECTED: { label: 'Отклонена', cls: s.badgeRed },
  CANCELLED: { label: 'Отменена', cls: s.badgeGray },
};

export const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; cls: string }> = {
  PENDING: { label: 'Ожидание', cls: s.badgeOrange },
  AUTHORIZED: { label: 'Авторизован', cls: s.badgeBlue },
  CAPTURED: { label: 'Списан', cls: s.badgeGreen },
  CANCELED: { label: 'Отменён', cls: s.badgeGray },
  REFUNDED: { label: 'Возврат', cls: s.badgePurple },
};

export const ROLE_MAP: Record<UserRole, { label: string; cls: string }> = {
  user: { label: 'Пользователь', cls: s.badgeGray },
  moderator: { label: 'Модератор', cls: s.badgeBlue },
  admin: { label: 'Админ', cls: s.badgePurple },
};

/* ── Constants ──────────────────────────────────────────────────────────── */

export const BAN_REASONS = [
  'Нарушение правил платформы',
  'Мошенничество',
  'Спам или реклама',
  'Оскорбительное поведение',
  'Фейковые объявления',
  'Подозрительная активность',
  'Нарушение условий сделки',
  'Множественные жалобы',
] as const;
