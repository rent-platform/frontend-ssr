import type { AdsItemResponseDto } from "@/business/ads/types";

export type FavoriteItemId = string;

export type FavoriteMutationArgs = {
  itemId: FavoriteItemId;
};

export type FavoriteResponseDto = {
  message?: string;
  itemId?: FavoriteItemId;
  isFavorite?: boolean;
  ad?: AdsItemResponseDto;
};
