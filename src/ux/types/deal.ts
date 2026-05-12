/**
 * UI-level deal status with all 7 states from project documentation.
 * Extends backend DealStatus (6 states) with AWAITING_PAYMENT.
 * When backend adds AWAITING_PAYMENT, replace this with re-export from @/business/deals/types.
 */
export type UiDealStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'AWAITING_PAYMENT'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

/** Human-readable labels per status (документация) */
export const UI_DEAL_STATUS_LABEL: Record<UiDealStatus, string> = {
  PENDING:          'Ожидает подтверждения',
  CONFIRMED:        'Подтверждена',
  AWAITING_PAYMENT: 'Ожидает оплаты',
  ACTIVE:           'В аренде',
  COMPLETED:        'Завершена',
  REJECTED:         'Отклонена',
  CANCELLED:        'Отменена',
};

/** Short labels for compact badges */
export const UI_DEAL_STATUS_SHORT: Record<UiDealStatus, string> = {
  PENDING:          'Ожидает',
  CONFIRMED:        'Подтверждена',
  AWAITING_PAYMENT: 'Ожидает оплаты',
  ACTIVE:           'В аренде',
  COMPLETED:        'Завершена',
  REJECTED:         'Отклонена',
  CANCELLED:        'Отменена',
};
