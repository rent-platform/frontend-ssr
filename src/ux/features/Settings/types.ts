import type { NotificationType } from '@/business/notifications/types';

/* ═══ Settings Tabs ═══ */

export type SettingsTab = 'profile' | 'security' | 'notifications' | 'payment' | 'privacy';

/* ═══ Profile form ═══ */

export type ProfileFormData = {
  fullName: string;
  nickname: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string | null;
};

/* ═══ Password form ═══ */

export type PasswordFormData = {
  current: string;
  next: string;
  confirm: string;
};

/* ═══ Notification toggles ═══ */

export type NotificationToggles = Record<NotificationType, boolean>;

/* ═══ Active session ═══ */

export type ActiveSession = {
  id: string;
  deviceInfo: string;
  deviceName: string;
  platform: 'desktop' | 'mobile' | 'tablet';
  isCurrent: boolean;
  lastActive: string;
  createdAt: string;
};

/* ═══ Payment method (view-only card) ═══ */

export type PaymentMethod = {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};
