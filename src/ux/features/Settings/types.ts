import type { NotificationType } from '@/business/types/entity';

/* ═══ Settings Tabs ═══ */

export type SettingsTab = 'profile' | 'security' | 'notifications' | 'payment' | 'privacy';

/* ═══ Profile form ═══ */

export type ProfileFormData = {
  full_name: string;
  nickname: string;
  email: string;
  phone: string;
  bio: string;
  avatar_url: string | null;
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
  device_info: string;
  device_name: string;
  platform: 'desktop' | 'mobile' | 'tablet';
  isCurrent: boolean;
  last_active: string;
  created_at: string;
};

/* ═══ Payment method (view-only card) ═══ */

export type PaymentMethod = {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  isDefault: boolean;
};
