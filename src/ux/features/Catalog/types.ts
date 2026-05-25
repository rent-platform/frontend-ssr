import type { CatalogItemCardVM } from '@/business/ads';

export type CatalogUiItem = CatalogItemCardVM & {

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
  availability?: Array<{ availableDate: string; isAvailable: boolean }>;
  featured?: boolean;
  quickFilters?: string[];
  isFavorite?: boolean;
};

export type CatalogSortKey =
  | 'popular'
  | 'priceAsc'
  | 'priceDesc'
  | 'newest'
  | 'rating';

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
