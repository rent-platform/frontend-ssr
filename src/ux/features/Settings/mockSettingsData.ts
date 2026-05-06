import type {
  ProfileFormData,
  NotificationToggles,
  ActiveSession,
  PaymentMethod,
} from './types';

export const MOCK_PROFILE: ProfileFormData = {
  fullName: 'Владислав Петров',
  nickname: 'vlad_rent',
  email: 'vlad@example.com',
  phone: '+7 (999) 123-45-67',
  bio: 'Сдаю фототехнику и электронику в Новосибирске. Быстрая выдача, всё проверено.',
  avatarUrl: null,
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
    deviceInfo: 'Chrome 124 · Windows 11',
    deviceName: 'Основной ПК',
    platform: 'desktop',
    isCurrent: true,
    lastActive: '2025-04-22T12:00:00Z',
    createdAt: '2025-04-10T09:15:00Z',
  },
  {
    id: 's-002',
    deviceInfo: 'Safari · iPhone 15 Pro',
    deviceName: 'iPhone Влада',
    platform: 'mobile',
    isCurrent: false,
    lastActive: '2025-04-21T18:30:00Z',
    createdAt: '2025-04-05T14:00:00Z',
  },
  {
    id: 's-003',
    deviceInfo: 'Firefox 125 · macOS Sonoma',
    deviceName: 'MacBook работа',
    platform: 'desktop',
    isCurrent: false,
    lastActive: '2025-04-19T10:00:00Z',
    createdAt: '2025-03-28T11:20:00Z',
  },
];

export const MOCK_PAYMENTS: PaymentMethod[] = [
  {
    id: 'pm-001',
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expMonth: 12,
    expYear: 2026,
    isDefault: true,
  },
  {
    id: 'pm-002',
    type: 'card',
    last4: '8901',
    brand: 'Mastercard',
    expMonth: 3,
    expYear: 2027,
    isDefault: false,
  },
];
