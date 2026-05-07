import type { TrustLevel, PublicListing, PublicUser } from './types';
import type { CatalogUiItem } from '../Catalog';

export const VISIBLE_LISTINGS = 6;
export const VISIBLE_REVIEWS = 4;

export const TRUST_LABELS: Record<TrustLevel, string> = {
  new: 'Новый пользователь',
  verified: 'Проверенный',
  experienced: 'Опытный арендодатель',
  super: 'Суперарендодатель',
};

export const RATING_DISTRIBUTION = [
  { stars: 5, count: 68 },
  { stars: 4, count: 12 },
  { stars: 3, count: 5 },
  { stars: 2, count: 1 },
  { stars: 1, count: 1 },
];

export function publicListingToCatalogItem(listing: PublicListing, user: PublicUser): CatalogUiItem {
  return {
    id: listing.id,
    title: listing.title,
    coverImageUrl: listing.image ?? '',
    images: listing.image ? [listing.image] : [],
    category: listing.category,
    pricePerDay: listing.pricePerDay,
    pricePerHour: null,
    depositAmount: '',
    pickupLocation: user.city,
    status: 'ACTIVE' as const,
    isAvailable: listing.isAvailable,
    viewsCount: 0,
    createdAt: user.memberSince,
    nearestAvailableDate: null,
    ownerName: user.fullName,
    ownerAvatar: user.avatarUrl,
    ownerRating: listing.rating,
    quickFilters: [],
  } as CatalogUiItem;
}
