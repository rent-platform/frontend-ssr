import type { AdsItemResponseDto } from "@/business/ads/types";

export type FavoriteAdId = string;

export type FavoriteMutationArgs = {
  adId: FavoriteAdId;
};

export type FavoriteResponseDto = {
  adId: FavoriteAdId;
  isFavorite: boolean;
  ad?: AdsItemResponseDto;
};
