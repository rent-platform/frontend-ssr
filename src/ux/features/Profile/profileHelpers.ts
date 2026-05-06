import type { ItemStatus } from '@/business/ads';
import type { DealStatus } from '@/business/deals';
import type { CatalogUiItem } from '../Catalog';
import type { ProfileListing } from './types';
import { MOCK_USER } from './mockProfileData';
import styles from './ProfileDashboard.module.scss';

export const EASE = [0.23, 1, 0.32, 1] as const;

export type ListingFilter = 'all' | ItemStatus;
export type BookingFilter = 'all' | DealStatus;

export const DEAL_STATUS_CLS: Record<DealStatus, string> = {
  PENDING: styles.statusNew,
  CONFIRMED: styles.statusConfirmed,
  ACTIVE: styles.statusActive,
  COMPLETED: styles.statusCompleted,
  REJECTED: styles.statusRejected,
  CANCELLED: styles.statusArchived,
};

export const LISTING_FILTERS: { value: ListingFilter; label: string; tip: string }[] = [
  { value: 'all', label: 'Все', tip: 'Показать все объявления' },
  { value: 'ACTIVE', label: 'Активные', tip: 'Опубликованы и доступны для аренды' },
  { value: 'MODERATION', label: 'Модерация', tip: 'На проверке модератором' },
  { value: 'DRAFT', label: 'Черновики', tip: 'Незавершённые объявления' },
  { value: 'ARCHIVED', label: 'Архив', tip: 'Снятые с публикации' },
];

export const BOOKING_FILTERS: { value: BookingFilter; label: string; tip: string }[] = [
  { value: 'all', label: 'Все', tip: 'Показать все аренды' },
  { value: 'ACTIVE', label: 'Активные', tip: 'Вещь сейчас у арендатора' },
  { value: 'CONFIRMED', label: 'Подтверждённые', tip: 'Ожидают начала аренды' },
  { value: 'COMPLETED', label: 'Завершённые', tip: 'Аренда успешно завершена' },
  { value: 'REJECTED', label: 'Отклонённые', tip: 'Запрос на аренду отклонён' },
];

export function profileListingToCatalogItem(listing: ProfileListing): CatalogUiItem {
  return {
    id: listing.id,
    ownerId: null,
    categoryId: null,
    title: listing.title,
    coverImageUrl: listing.image ?? '',
    images: listing.image ? [listing.image] : [],
    category: listing.category,
    pricePerDay: listing.pricePerDay ?? null,
    pricePerHour: null,
    depositAmount: '',
    pickupLocation: 'Новосибирск',
    status: listing.status,
    isAvailable: listing.status === 'ACTIVE',
    viewsCount: listing.viewsCount,
    createdAt: listing.createdAt,
    nearestAvailableDate: null,
    ownerName: MOCK_USER.fullName,
    ownerAvatar: MOCK_USER.avatarUrl,
    ownerRating: MOCK_USER.rating,
    ownerReviewCount: MOCK_USER.reviewCount,
    itemRating: null,
    itemReviewCount: null,
    quickFilters: [],
    featured: listing.bookingsCount > 10,
  } as CatalogUiItem;
}

export function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function getProfileCompletion(user: typeof MOCK_USER): number {
  let score = 0;
  if (user.avatarUrl) score += 20;
  if (user.bio) score += 20;
  if (user.phone) score += 20;
  if (user.email) score += 20;
  if (user.nickname) score += 10;
  score += 10;
  return Math.min(score, 100);
}
