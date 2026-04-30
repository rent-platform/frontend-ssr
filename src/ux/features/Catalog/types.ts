import type { CatalogItemCardVM } from '@/business/types';

export type CatalogUiItem = CatalogItemCardVM & {
  /* ── Derivable via JOINs (category_id → categories, owner_id → users, item_id → photos) ── */
  category: string;
  ownerName: string;
  ownerAvatar: string | null;
  images: string[];

  /* ── Computed (AVG reviews.rating) ── */
  ownerRating?: number;

  /* ── No DB backing yet — kept optional for forward-compat ── */
  itemDescription?: string;
  dateAvailable?: string;
  city?: string;
  responseTime?: string;
  tags?: string[];
  pickupWindow?: string;
  rentalTerms?: string[];
  specs?: Array<{ label: string; value: string }>;
  description?: string[];
  featured?: boolean;
  quickFilters?: string[];
};

export type CatalogSortKey =
  | 'popular'
  | 'priceAsc'
  | 'priceDesc'
  | 'newest'
  | 'rating';

export type AvailabilityFilter = 'all' | 'available' | 'soon';
export type CatalogSort = CatalogSortKey;
export type CatalogCategory =
  | 'Электроника'
  | 'Фото и видео'
  | 'Инструменты'
  | 'Для дома'
  | 'Спорт и отдых'
  | 'Детские товары'
  | 'Мероприятия';

export type CatalogQuickFiltersState = {
  instantBook: boolean;
  noDeposit: boolean;
  newArrival: boolean;
  delivery: boolean;
};

export type QuickFilterKey = keyof CatalogQuickFiltersState;

export type CatalogViewMode = 'catalog' | 'detail';

export type CatalogFilterState = {
  search: string;
  city: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  onlyAvailable: boolean;
  sortBy: CatalogSortKey;
  quickFilter: string | null;
  hasDeposit: 'all' | 'yes' | 'no';
};
