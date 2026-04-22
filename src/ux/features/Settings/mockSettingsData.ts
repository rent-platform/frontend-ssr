import type {
  ProfileFormData,
  NotificationToggles,
  ActiveSession,
  PaymentMethod,
} from './types';

export const MOCK_PROFILE: ProfileFormData = {
  full_name: 'Владислав Петров',
  nickname: 'vlad_rent',
  email: 'vlad@example.com',
  phone: '+7 (999) 123-45-67',
  bio: 'Сдаю фототехнику и электронику в Новосибирске. Быстрая выдача, всё проверено.',
  avatar_url: null,
};

export const MOCK_NOTIFICATIONS: NotificationToggles = {
  new_deal: true,
  deal_status_changed: true,
  new_message: true,
  review_received: true,
  payment_status: false,
};

export const MOCK_SESSIONS: ActiveSession[] = [
  {
    id: 's-001',
    device_info: 'Chrome 124 · Windows 11',
    device_name: 'Основной ПК',
    platform: 'desktop',
    isCurrent: true,
    last_active: '2025-04-22T12:00:00Z',
    created_at: '2025-04-10T09:15:00Z',
  },
  {
    id: 's-002',
    device_info: 'Safari · iPhone 15 Pro',
    device_name: 'iPhone Влада',
    platform: 'mobile',
    isCurrent: false,
    last_active: '2025-04-21T18:30:00Z',
    created_at: '2025-04-05T14:00:00Z',
  },
  {
    id: 's-003',
    device_info: 'Firefox 125 · macOS Sonoma',
    device_name: 'MacBook работа',
    platform: 'desktop',
    isCurrent: false,
    last_active: '2025-04-19T10:00:00Z',
    created_at: '2025-03-28T11:20:00Z',
  },
];

export const MOCK_PAYMENTS: PaymentMethod[] = [
  {
    id: 'pm-001',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    exp_month: 12,
    exp_year: 2026,
    isDefault: true,
  },
  {
    id: 'pm-002',
    type: 'card',
    last4: '8901',
    brand: 'Mastercard',
    exp_month: 3,
    exp_year: 2027,
    isDefault: false,
  },
];
