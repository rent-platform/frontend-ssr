import type { PaymentStatus } from '@/business/payments/types/payments.dto';
import type { PaymentUiState } from './types';

const PAYMENT_UI_MAP: Record<PaymentStatus, PaymentUiState> = {
  PENDING: {
    status: 'pending',
    label: 'Ожидает оплаты',
    description: 'Перейдите по ссылке для оплаты через ЮKassa',
    icon: 'Clock',
    color: 'warning',
    canRetry: false,
    canCancel: true,
  },
  AUTHORIZED: {
    status: 'authorized',
    label: 'Средства заморожены',
    description: 'Деньги списаны с карты и удерживаются до завершения аренды',
    icon: 'ShieldCheck',
    color: 'info',
    canRetry: false,
    canCancel: false,
  },
  CAPTURED: {
    status: 'captured',
    label: 'Оплата завершена',
    description: 'Средства переведены арендодателю. Аренда оплачена',
    icon: 'CheckCircle',
    color: 'success',
    canRetry: false,
    canCancel: false,
  },
  CANCELED: {
    status: 'canceled',
    label: 'Платёж отменён',
    description: 'Платёж был отменён. Средства не списаны',
    icon: 'XCircle',
    color: 'danger',
    canRetry: true,
    canCancel: false,
  },
  REFUNDED: {
    status: 'refunded',
    label: 'Возврат средств',
    description: 'Деньги возвращены на вашу карту',
    icon: 'RotateCcw',
    color: 'neutral',
    canRetry: false,
    canCancel: false,
  },
};

const ERROR_UI_STATE: PaymentUiState = {
  status: 'error',
  label: 'Ошибка',
  description: 'Не удалось загрузить данные платежа. Попробуйте ещё раз',
  icon: 'AlertTriangle',
  color: 'danger',
  canRetry: true,
  canCancel: false,
};

export function getPaymentUiState(status: PaymentStatus | null | undefined, isError?: boolean): PaymentUiState {
  if (isError || !status) return ERROR_UI_STATE;
  return PAYMENT_UI_MAP[status] ?? ERROR_UI_STATE;
}

export function formatPaymentAmount(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const POLLING_INTERVAL_MS = 5000;

export const POLLING_STATUSES: PaymentStatus[] = ['PENDING', 'AUTHORIZED'];
