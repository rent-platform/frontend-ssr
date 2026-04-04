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
  | 'newest';

export type CatalogViewMode = 'catalog' | 'detail';

export type CatalogFilterState = {
  search: string;
  city: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  onlyAvailable: boolean;
  pricingMode: 'day' | 'hour';
  sortBy: CatalogSortKey;
  quickFilter: string | null;
};
