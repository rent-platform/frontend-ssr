import type { CatalogItemCardVM } from "@/business/types";

export type CatalogCategory =
  | "Электроника"
  | "Фото и видео"
  | "Для спорта"
  | "Для дома"
  | "Инструменты"
  | "Путешествия";

export type CatalogSort =
  | "popular"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating";

export type AvailabilityFilter = "all" | "available" | "soon";
export type PriceModeFilter = "all" | "day" | "hour";
export type QuickFilterKey = "instantBook" | "noDeposit" | "newArrival" | "delivery";

export type CatalogCardViewModel = CatalogItemCardVM & {
  category: CatalogCategory;
  ownerName: string;
  ownerAvatar: string;
  rating: number;
  reviewsCount: number;
  instantBook: boolean;
  delivery: boolean;
  isNewArrival: boolean;
  featured?: boolean;
  tags: string[];
};

export type CatalogQuickFiltersState = Record<QuickFilterKey, boolean>;
