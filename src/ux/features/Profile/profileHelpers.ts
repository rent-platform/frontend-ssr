import type { ItemStatus } from '@/business/ads/types';
import type { DealStatus } from '@/business/deals/types';
import type { CatalogUiItem } from '../Catalog';
import type { ProfileListing } from './types';
import { MOCK_USER } from './mockProfileData';
import styles from './ProfileDashboard.module.scss';

export type ListingFilter = 'all' | ItemStatus;
export type BookingFilter = 'all' | DealStatus;

export const DEAL_STATUS_MAP: Record<DealStatus, { label: string; cls: string }> = {
  PENDING:   { label: 'Ожидает',     cls: styles.statusNew },
  CONFIRMED: { label: 'Подтверждена', cls: styles.statusConfirmed },
  ACTIVE:    { label: 'Активна',     cls: styles.statusActive },
  COMPLETED: { label: 'Завершена',   cls: styles.statusCompleted },
  REJECTED:  { label: 'Отклонена',   cls: styles.statusRejected },
  CANCELLED: { label: 'Отменена',    cls: styles.statusArchived },
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
    quickFilters: [],
    featured: listing.bookingsCount > 10,
  } as CatalogUiItem;
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
