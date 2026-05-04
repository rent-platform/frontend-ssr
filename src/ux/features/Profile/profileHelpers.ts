import type { ItemStatus, DealStatus } from '@/business/types/entity';
import type { CatalogUiItem } from '../Catalog/types';
import type { ProfileListing } from './types';
import { MOCK_USER } from './mockProfileData';
import styles from './ProfileDashboard.module.scss';

export const EASE = [0.23, 1, 0.32, 1] as const;

export type ListingFilter = 'all' | ItemStatus;
export type BookingFilter = 'all' | DealStatus;

export const DEAL_STATUS_MAP: Record<DealStatus, { label: string; cls: string }> = {
  new:       { label: 'Ожидает',     cls: styles.statusNew },
  confirmed: { label: 'Подтверждена', cls: styles.statusConfirmed },
  active:    { label: 'Активна',     cls: styles.statusActive },
  completed: { label: 'Завершена',   cls: styles.statusCompleted },
  rejected:  { label: 'Отклонена',   cls: styles.statusRejected },
  cancelled: { label: 'Отменена',    cls: styles.statusArchived },
};

export const LISTING_FILTERS: { value: ListingFilter; label: string; tip: string }[] = [
  { value: 'all', label: 'Все', tip: 'Показать все объявления' },
  { value: 'active', label: 'Активные', tip: 'Опубликованы и доступны для аренды' },
  { value: 'moderation', label: 'Модерация', tip: 'На проверке модератором' },
  { value: 'draft', label: 'Черновики', tip: 'Незавершённые объявления' },
  { value: 'archived', label: 'Архив', tip: 'Снятые с публикации' },
];

export const BOOKING_FILTERS: { value: BookingFilter; label: string; tip: string }[] = [
  { value: 'all', label: 'Все', tip: 'Показать все аренды' },
  { value: 'active', label: 'Активные', tip: 'Вещь сейчас у арендатора' },
  { value: 'confirmed', label: 'Подтверждённые', tip: 'Ожидают начала аренды' },
  { value: 'completed', label: 'Завершённые', tip: 'Аренда успешно завершена' },
  { value: 'rejected', label: 'Отклонённые', tip: 'Запрос на аренду отклонён' },
];

export function profileListingToCatalogItem(listing: ProfileListing): CatalogUiItem {
  return {
    id: listing.id,
    title: listing.title,
    coverImageUrl: listing.image ?? '',
    images: listing.image ? [listing.image] : [],
    category: listing.category,
    pricePerDay: listing.price_per_day ?? null,
    pricePerHour: null,
    depositAmount: '',
    pickupLocation: 'Новосибирск',
    status: listing.status,
    isAvailable: listing.status === 'active',
    viewsCount: listing.views_count,
    createdAt: listing.created_at,
    nearestAvailableDate: null,
    ownerName: MOCK_USER.full_name,
    ownerAvatar: MOCK_USER.avatar_url,
    ownerRating: MOCK_USER.rating,
    quickFilters: [],
    featured: listing.bookingsCount > 10,
  } as CatalogUiItem;
}

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function getProfileCompletion(user: typeof MOCK_USER): number {
  let score = 0;
  if (user.avatar_url) score += 20;
  if (user.bio) score += 20;
  if (user.phone) score += 20;
  if (user.email) score += 20;
  if (user.nickname) score += 10;
  score += 10;
  return Math.min(score, 100);
}
