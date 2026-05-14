import type { DealDetailsData } from './types';

const BASE_DEAL: Omit<DealDetailsData, 'id' | 'status' | 'viewMode' | 'participant' | 'rejectionReason' | 'cancellationReason'> = {
  title: 'Фотоаппарат Canon EOS 250D',
  imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=500&fit=crop',
  startDate: '2026-04-23',
  endDate: '2026-04-25',
  rentalPrice: 15000,
  deposit: 15000,
  city: 'Астана',
  pickupLocation: 'центр города',
};

const RENTER_PARTICIPANT = {
  name: 'ivan_phone',
  initial: 'I',
  role: 'renter' as const,
  avatarColor: '#22c55e',
};

const OWNER_PARTICIPANT = {
  name: 'maria_home',
  initial: 'M',
  role: 'owner' as const,
  avatarColor: '#64748b',
};

export const MOCK_DEAL_SCENARIOS: DealDetailsData[] = [
  {
    ...BASE_DEAL,
    id: 'deal-1',
    status: 'PENDING',
    viewMode: 'renter',
    participant: OWNER_PARTICIPANT,
  },
  {
    ...BASE_DEAL,
    id: 'deal-2',
    status: 'PENDING',
    viewMode: 'owner',
    participant: RENTER_PARTICIPANT,
  },
  {
    ...BASE_DEAL,
    id: 'deal-3',
    status: 'CONFIRMED',
    viewMode: 'owner',
    participant: RENTER_PARTICIPANT,
  },
  {
    ...BASE_DEAL,
    id: 'deal-4',
    status: 'AWAITING_PAYMENT',
    viewMode: 'renter',
    participant: OWNER_PARTICIPANT,
  },
  {
    ...BASE_DEAL,
    id: 'deal-4b',
    status: 'AWAITING_PAYMENT',
    viewMode: 'owner',
    participant: RENTER_PARTICIPANT,
  },
  {
    ...BASE_DEAL,
    id: 'deal-5',
    status: 'ACTIVE',
    viewMode: 'owner',
    participant: RENTER_PARTICIPANT,
  },
  {
    ...BASE_DEAL,
    id: 'deal-6',
    status: 'ACTIVE',
    viewMode: 'renter',
    participant: OWNER_PARTICIPANT,
  },
  {
    ...BASE_DEAL,
    id: 'deal-7',
    status: 'COMPLETED',
    viewMode: 'renter',
    participant: OWNER_PARTICIPANT,
  },
  {
    ...BASE_DEAL,
    id: 'deal-8',
    status: 'REJECTED',
    viewMode: 'renter',
    participant: OWNER_PARTICIPANT,
    rejectionReason: 'Владелец отклонил заявку: вещь уже занята на выбранные даты.',
  },
  {
    ...BASE_DEAL,
    id: 'deal-9',
    status: 'CANCELLED',
    viewMode: 'owner',
    participant: RENTER_PARTICIPANT,
    cancellationReason: 'Сделка отменена по договорённости сторон.',
  },
];

export const MOCK_SCENARIO_LABELS: string[] = [
  'Ожидание (арендатор)',
  'Ожидание (владелец)',
  'Подтверждена (владелец)',
  'Ожидает оплаты (арендатор)',
  'Ожидает оплаты (владелец)',
  'В аренде (владелец)',
  'В аренде (арендатор)',
  'Завершена (арендатор)',
  'Отклонена (арендатор)',
  'Отменена (владелец)',
];
