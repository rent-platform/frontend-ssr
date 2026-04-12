import type { CatalogItemCardVM } from '@/business/types';

export type CatalogUiItem = CatalogItemCardVM & {
  category: string;
  city: string;
  ownerName: string;
  ownerAvatar: string;
  ownerRating: number;
  responseTime: string;
  images: string[];
  tags: string[];
  pickupWindow: string;
  rentalTerms: string[];
  specs: Array<{ label: string; value: string }>;
  description: string[];
  featured?: boolean;
  quickFilters: string[];
};

export type CatalogSortKey =
  | 'popular'
  | 'priceAsc'
  | 'priceDesc'
  | 'newest'
  | 'rating';

export type AvailabilityFilter = 'all' | 'available' | 'soon';
export type PriceModeFilter = 'all' | 'day' | 'hour';
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
  // Новые параметры для профессионального шеринга
  condition: string[]; // ['new', 'like_new', 'used']
  ownerType: 'all' | 'private' | 'pro';
  deliveryType: 'all' | 'pickup' | 'delivery';
  hasDeposit: 'all' | 'yes' | 'no';
};
