import type { CatalogItemCardVM } from '@/business/types';

export type CatalogUiItem = CatalogItemCardVM & {
  /* ── Derivable via JOINs (category_id → categories, owner_id → users, item_id → photos) ── */
  category: string;
  ownerName: string;
  ownerAvatar: string | null;
  images: string[];

  /* ── Computed (AVG reviews.rating, COUNT reviews) ── */
  ownerRating?: number;
  ownerReviewCount?: number;

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
