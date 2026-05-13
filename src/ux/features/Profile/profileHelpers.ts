import type { ItemStatus } from '@/business/ads/types';
import { UI_DEAL_STATUS_LABEL, UI_ITEM_STATUS_LABEL } from '@/ux/types';
import type { UiDealStatus } from '@/ux/types';
import type { CatalogUiItem } from '../Catalog';
import type { ProfileUser, ProfileListing } from './types';
import { MOCK_USER } from './mockProfileData';
import styles from './ProfileDashboard.module.scss';

export type ListingFilter = 'all' | ItemStatus;
export type BookingFilter = 'all' | UiDealStatus;

export const DEAL_STATUS_MAP: Record<UiDealStatus, { label: string; cls: string }> = {
  PENDING:          { label: UI_DEAL_STATUS_LABEL.PENDING,          cls: styles.statusNew },
  CONFIRMED:        { label: UI_DEAL_STATUS_LABEL.CONFIRMED,        cls: styles.statusConfirmed },
  AWAITING_PAYMENT: { label: UI_DEAL_STATUS_LABEL.AWAITING_PAYMENT, cls: styles.statusPayment },
  ACTIVE:           { label: UI_DEAL_STATUS_LABEL.ACTIVE,           cls: styles.statusActive },
  COMPLETED:        { label: UI_DEAL_STATUS_LABEL.COMPLETED,        cls: styles.statusCompleted },
  REJECTED:         { label: UI_DEAL_STATUS_LABEL.REJECTED,         cls: styles.statusRejected },
  CANCELLED:        { label: UI_DEAL_STATUS_LABEL.CANCELLED,        cls: styles.statusArchived },
};

export const LISTING_FILTERS: { value: ListingFilter; label: string; tip: string }[] = [
  { value: 'all', label: 'Все', tip: 'Показать все объявления' },
  { value: 'ACTIVE', label: 'Активные', tip: 'Опубликованы и доступны для аренды' },
  { value: 'MODERATION', label: 'Модерация', tip: 'На проверке модератором' },
  { value: 'REJECTED', label: 'Отклонённые', tip: 'Отклонены модератором, требуют исправления' },
  { value: 'DRAFT', label: 'Черновики', tip: 'Незавершённые объявления' },
  { value: 'ARCHIVED', label: 'Архив', tip: 'Снятые с публикации' },
];

export const BOOKING_FILTERS: { value: BookingFilter; label: string; tip: string }[] = [
  { value: 'all', label: 'Все', tip: 'Показать все аренды' },
  { value: 'ACTIVE', label: 'Активные', tip: 'Вещь сейчас у арендатора' },
  { value: 'CONFIRMED', label: 'Подтверждённые', tip: 'Ожидают формирования счёта' },
  { value: 'AWAITING_PAYMENT', label: 'Ожидают оплаты', tip: 'Счёт выставлен, ожидается оплата' },
  { value: 'COMPLETED', label: 'Завершённые', tip: 'Аренда успешно завершена' },
  { value: 'REJECTED', label: 'Отклонённые', tip: 'Запрос на аренду отклонён' },
];

export const ITEM_STATUS_MAP: Record<ItemStatus, { label: string; cls: string }> = {
  ACTIVE:     { label: UI_ITEM_STATUS_LABEL.ACTIVE,     cls: styles.statusActive },
  MODERATION: { label: UI_ITEM_STATUS_LABEL.MODERATION, cls: styles.statusModeration },
  DRAFT:      { label: UI_ITEM_STATUS_LABEL.DRAFT,      cls: styles.statusDraft },
  ARCHIVED:   { label: UI_ITEM_STATUS_LABEL.ARCHIVED,   cls: styles.statusArchived },
  REJECTED:   { label: UI_ITEM_STATUS_LABEL.REJECTED,   cls: styles.statusRejected },
};

export function profileListingToCatalogItem(listing: ProfileListing): CatalogUiItem {
  return {
    id: listing.id,
    title: listing.title,
    coverImageUrl: listing.image ?? '',
    images: listing.images.length > 0 ? listing.images : (listing.image ? [listing.image] : []),
    category: listing.category,
    pricePerDay: listing.pricePerDay ?? null,
    pricePerHour: listing.pricePerHour ?? null,
    depositAmount: listing.depositAmount ?? '',
    pickupLocation: listing.location,
    status: listing.status,
    isAvailable: listing.status === 'ACTIVE',
    viewsCount: listing.viewsCount,
    createdAt: listing.createdAt,
    nearestAvailableDate: null,
    ownerId: MOCK_USER.id,
    ownerName: MOCK_USER.fullName,
    ownerAvatar: MOCK_USER.avatarUrl,
    ownerRating: MOCK_USER.rating,
    quickFilters: [],
    featured: listing.bookingsCount > 10,
  } as CatalogUiItem;
}

export function getProfileCompletion(user: ProfileUser): number {
  let score = 0;
  if (user.avatarUrl) score += 20;
  if (user.bio) score += 20;
  if (user.phone) score += 20;
  if (user.email) score += 20;
  if (user.nickname) score += 10;
  score += 10;
  return Math.min(score, 100);
}
