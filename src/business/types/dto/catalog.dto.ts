import type { ItemStatus } from "@/business/types/entity/catalog.types";

export type CatalogItemResponseDto = {
  id: string;
  owner_id: string;
  title: string;
  item_description: string | null;
  price_per_day: string | null; // DECIMAL хранится строкой
  price_per_hour: string | null;
  deposit_amount: string;
  pickup_location: string | null;
  status: ItemStatus;
  views_count: number;
  created_at: string;
  photos: Array<{ photo_url: string; sort_order: number }>;
  is_available: boolean;
  nearest_available_date: string | null;
};

export type CatalogListResponseDto = {
  items: CatalogItemResponseDto[];
  total: number;
  page: number;
  limit: number;
};

export type CatalogQueryParams = {
  page?: number;
  limit?: number;
  category_id?: number;
  search?: string;
};
