import { Star } from 'lucide-react';
import { createElement } from 'react';
import s from '../../layouts/AdminLayout/AdminLayout.module.scss';
import type { ComplaintPriority, ComplaintStatus, ComplaintTarget } from './types';

/* ── Date / price formatters ──────────────────────────────────────────── */

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPrice(v: number | null | undefined) {
  if (v == null) return '—';
  return v.toLocaleString('ru-RU') + ' ₽';
}

/* ── Waiting time ─────────────────────────────────────────────────────── */

export function getWaitingTime(isoDate: string): { text: string; urgent: boolean } {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return { text: `${days}д ${hours % 24}ч`, urgent: days >= 1 };
  if (hours > 0) return { text: `${hours}ч`, urgent: hours >= 4 };
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  return { text: `${mins}мин`, urgent: false };
}

/* ── Stars renderer ───────────────────────────────────────────────────── */

export function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) =>
    createElement(Star, {
      key: i,
      size: 14,
      fill: i < rating ? '#f59e0b' : 'none',
      stroke: i < rating ? '#f59e0b' : '#cbd5e1',
    }),
  );
}

/* ── Mapping constants ────────────────────────────────────────────────── */

export const PRIORITY_MAP: Record<ComplaintPriority, { label: string; cls: string }> = {
  low: { label: 'Низкий', cls: s.badgeGray },
  medium: { label: 'Средний', cls: s.badgeOrange },
  high: { label: 'Высокий', cls: s.badgeRed },
  critical: { label: 'Критический', cls: s.badgePurple },
};

export const STATUS_MAP: Record<ComplaintStatus, { label: string; cls: string }> = {
  new: { label: 'Открыта', cls: s.badgeBlue },
  in_review: { label: 'В обработке', cls: s.badgeOrange },
  resolved: { label: 'Решена', cls: s.badgeGreen },
  dismissed: { label: 'Отклонена', cls: s.badgeGray },
};

export const TARGET_MAP: Record<ComplaintTarget, string> = {
  item: 'Объявление',
  user: 'Пользователь',
  review: 'Отзыв',
};

export const PRIORITY_DOT_MAP: Record<ComplaintPriority, string> = {
  low: s.priorityDotLow,
  medium: s.priorityDotMedium,
  high: s.priorityDotHigh,
  critical: s.priorityDotCritical,
};
