"use client";

import { useFetchItemReviewSummaryQuery } from "../api";
import { getApiError, type ApiUiError } from "@/business/shared";
import type { ItemRatingSummaryDTO } from "../types";

export interface UseGetItemRatingResult {
  rating: ItemRatingSummaryDTO | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetItemRating(
  itemId: string,
  options: { skip?: boolean } = {},
): UseGetItemRatingResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchItemReviewSummaryQuery(itemId, { skip: options.skip || !itemId });

  return {
    rating: data ?? null,
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}
