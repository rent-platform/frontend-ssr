"use client";

import {
  useFetchAdByIdQuery,
  useFetchItemAvailabilityQuery,
  useFetchSimilarAdsQuery,
} from "../api";
import { mapCatalogItemToCardVM, mapCatalogShortItemToCardVM } from "../mappers";
import { getApiError, type ApiUiError } from "@/business/shared";
import { useFetchFavoriteStatusQuery } from "@/business/favorites/api";
import { useFetchItemReviewSummaryQuery } from "@/business/reviews/api";
import type { CatalogUiItem } from "@/ux/features/Catalog";

export interface UseGetCatalogItemResult {
  item: CatalogUiItem | null;
  similarItems: CatalogUiItem[];
  isFavorite: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

function splitDescription(value?: string | null): string[] {
  if (!value) return [];

  return value
    .split(/\r?\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getAvailabilityRange() {
  const start = new Date();
  const end = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate());

  return {
    startDate: formatDateParam(start),
    endDate: formatDateParam(end),
  };
}

export function useGetCatalogItem(
  itemId: string,
  options: { skip?: boolean } = {},
): UseGetCatalogItemResult {
  const skip = options.skip || !itemId;
  const itemQuery = useFetchAdByIdQuery(itemId, { skip });
  const ratingQuery = useFetchItemReviewSummaryQuery(itemId, { skip });
  const favoriteQuery = useFetchFavoriteStatusQuery(itemId, { skip });
  const similarQuery = useFetchSimilarAdsQuery(itemId, { skip });
  const availabilityRange = getAvailabilityRange();
  const availabilityQuery = useFetchItemAvailabilityQuery(
    {
      itemId,
      startDate: availabilityRange.startDate,
      endDate: availabilityRange.endDate,
    },
    { skip },
  );

  const item: CatalogUiItem | null = itemQuery.data
    ? {
        ...mapCatalogItemToCardVM(itemQuery.data),
        city: itemQuery.data.city ?? undefined,
        itemDescription: itemQuery.data.itemDescription ?? undefined,
        description: splitDescription(itemQuery.data.itemDescription),
        availability: availabilityQuery.data ?? [],
        itemRating: ratingQuery.data?.averageRating ?? null,
        itemReviewCount: ratingQuery.data?.totalReviews ?? null,
      }
    : null;

  return {
    item,
    similarItems:
      similarQuery.data?.content.map((similar) => ({
        ...mapCatalogShortItemToCardVM(similar),
        city: similar.city ?? undefined,
      })) ?? [],
    isFavorite: favoriteQuery.data?.isFavorite ?? itemQuery.data?.isFavorite ?? false,
    isLoading: itemQuery.isLoading,
    isFetching:
      itemQuery.isFetching ||
      ratingQuery.isFetching ||
      favoriteQuery.isFetching ||
      availabilityQuery.isFetching ||
      similarQuery.isFetching,
    isError: itemQuery.isError,
    error: getApiError(itemQuery.error),
    refetch: itemQuery.refetch,
  };
}
