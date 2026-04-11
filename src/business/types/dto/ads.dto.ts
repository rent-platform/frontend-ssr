import type { ItemStatus } from "@/business/types/entity/catalog.types";
import type { DeepPartial } from "@/business/utils";

export type AdsItemResponseDto = {
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
  photos?: Array<{ photo_url: string; sort_order: number }>;
  is_available: boolean;
  nearest_available_date: string | null;
};

export type AdsListResponseDto = {
  items: AdsItemResponseDto[];
  total: number;
  page: number;
  limit: number;
};

export type AdsQueryParams = {
  page?: number;
  limit?: number;
  category_id?: number;
  search?: string;
};

export type UpdatePlaylistArgs = DeepPartial<AdsCreateAd>; //TODO: по сути patch?

export type AdsCreateAd = {
  title: string;
  item_description: string | null;
  price_per_day?: string | null; // TODO: пусть одно из них обязательное через формы и апи не дать пройти пустоте
  price_per_hour?: string | null;
  deposit_amount: string;
  pickup_location: string | null;
  photos?: Array<{ photo_url: string; sort_order: number }>; //TODO: брух это не будет работать
  nearest_available_date: string | null;
};
