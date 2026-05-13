import type { Payment, PaymentStatus } from '@/business/payments/types/payments.dto';

export const MOCK_PAYMENTS: Record<PaymentStatus, Payment> = {
  PENDING: {
    paymentId: 'pay-1',
    totalAmount: 18500,
    rentalAmount: 3500,
    depositAmount: 15000,
    status: 'PENDING',
    confirmationUrl: 'https://yookassa.ru/demo/pay-1',
  },
  AUTHORIZED: {
    paymentId: 'pay-2',
    totalAmount: 18500,
    rentalAmount: 3500,
    depositAmount: 15000,
    status: 'AUTHORIZED',
  },
  CAPTURED: {
    paymentId: 'pay-3',
    totalAmount: 18500,
    rentalAmount: 3500,
    depositAmount: 15000,
    status: 'CAPTURED',
  },
  CANCELED: {
    paymentId: 'pay-4',
    totalAmount: 18500,
    rentalAmount: 3500,
    depositAmount: 15000,
    status: 'CANCELED',
  },
  REFUNDED: {
    paymentId: 'pay-5',
    totalAmount: 18500,
    rentalAmount: 3500,
    depositAmount: 15000,
    status: 'REFUNDED',
  },
};

export const MOCK_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'PENDING', label: 'Ожидает оплаты' },
  { value: 'AUTHORIZED', label: 'Средства заморожены' },
  { value: 'CAPTURED', label: 'Оплата завершена' },
  { value: 'CANCELED', label: 'Платёж отменён' },
  { value: 'REFUNDED', label: 'Возврат средств' },
];
