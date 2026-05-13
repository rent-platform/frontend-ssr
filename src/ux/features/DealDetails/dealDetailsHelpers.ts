import type { UiDealStatus } from '@/ux/types/deal';
import type { DealStep, DealViewMode, DealStatusBadgeColor } from './types';

const STEP_DEFINITIONS: { title: string; description: string }[] = [
  { title: 'Заявка', description: 'Арендатор отправил запрос на аренду.' },
  { title: 'Подтверждение', description: 'Владелец подтверждает возможность аренды.' },
  { title: 'Оплата', description: 'Создание оплаты и внесение суммы аренды с залогом.' },
  { title: 'Передача вещи', description: 'Стороны подтверждают старт аренды после передачи вещи.' },
  { title: 'Завершение', description: 'Возврат вещи, подтверждение завершения и отзыв.' },
];

const STATUS_TO_ACTIVE_STEP: Record<UiDealStatus, number> = {
  PENDING: 1,
  CONFIRMED: 2,
  AWAITING_PAYMENT: 3,
  ACTIVE: 4,
  COMPLETED: 5,
  REJECTED: 1,
  CANCELLED: 3,
};

export function getDealSteps(status: UiDealStatus): DealStep[] {
  const activeStep = STATUS_TO_ACTIVE_STEP[status];

  return STEP_DEFINITIONS.map((def, i) => ({
    number: i + 1,
    title: def.title,
    description: def.description,
    completed: i + 1 <= activeStep,
  }));
}

const STATUS_MESSAGES: Record<UiDealStatus, Record<DealViewMode, string>> = {
  PENDING: {
    renter: 'Заявка отправлена. Ожидаем подтверждение владельца.',
    owner: 'Новая заявка ожидает вашего подтверждения.',
  },
  CONFIRMED: {
    renter: 'Заявка подтверждена. Ожидаем создание оплаты.',
    owner: 'Заявка подтверждена. Ссылка на оплату создана автоматически, ожидаем оплату от арендатора.',
  },
  AWAITING_PAYMENT: {
    renter: 'Оплатите аренду и залог, чтобы перейти к передаче вещи.',
    owner: 'Ожидаем оплату от арендатора.',
  },
  ACTIVE: {
    renter: 'Сделка активна. После возврата вещи стороны подтверждают завершение.',
    owner: 'Сделка активна. После возврата вещи стороны подтверждают завершение.',
  },
  COMPLETED: {
    renter: 'Аренда завершена. Теперь можно оставить отзыв по сделке.',
    owner: 'Аренда завершена. Теперь можно оставить отзыв по сделке.',
  },
  REJECTED: {
    renter: '',
    owner: '',
  },
  CANCELLED: {
    renter: '',
    owner: '',
  },
};

export function getStatusMessage(status: UiDealStatus, viewMode: DealViewMode): string {
  return STATUS_MESSAGES[status]?.[viewMode] ?? '';
}

export function getSubtitle(viewMode: DealViewMode): string {
  return viewMode === 'renter'
    ? 'Вы арендуете эту вещь'
    : 'Вы сдаёте эту вещь в аренду';
}

export function getStatusBadgeColor(status: UiDealStatus): DealStatusBadgeColor {
  if (status === 'REJECTED' || status === 'CANCELLED') return 'red';
  return 'green';
}

export interface DealActionConfig {
  primary?: { label: string; variant: 'green' | 'danger' };
  secondary?: { label: string; variant: 'danger' | 'outline' };
  showChat: boolean;
}

export function getDealActions(status: UiDealStatus, viewMode: DealViewMode): DealActionConfig {
  switch (status) {
    case 'PENDING':
      if (viewMode === 'owner') {
        return {
          primary: { label: 'Подтвердить заявку', variant: 'green' },
          secondary: { label: 'Отклонить заявку', variant: 'danger' },
          showChat: true,
        };
      }
      return {
        secondary: { label: 'Отменить сделку', variant: 'danger' },
        showChat: true,
      };

    case 'CONFIRMED':
      return {
        secondary: { label: 'Отменить сделку', variant: 'danger' },
        showChat: true,
      };

    case 'AWAITING_PAYMENT':
      if (viewMode === 'renter') {
        return {
          primary: { label: 'Оплатить', variant: 'green' },
          secondary: { label: 'Отменить сделку', variant: 'danger' },
          showChat: true,
        };
      }
      return {
        secondary: { label: 'Отменить сделку', variant: 'danger' },
        showChat: true,
      };

    case 'ACTIVE':
      return {
        primary: { label: 'Подтвердить возврат', variant: 'green' },
        showChat: true,
      };

    case 'COMPLETED':
      return {
        primary: { label: 'Оставить отзыв', variant: 'green' },
        showChat: true,
      };

    case 'REJECTED':
    case 'CANCELLED':
      return { showChat: true };

    default:
      return { showChat: true };
  }
}

export function formatDealDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDealPrice(amount: number): string {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' \u20BD';
}
