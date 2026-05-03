"use client";

import { useFetchReviewsByAdQuery } from "@/business/api";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { ReviewDTO } from "@/business/types";

export interface UseGetReviewsByAdResult {
  reviews: ReviewDTO[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetReviewsByAd(adId: string): UseGetReviewsByAdResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchReviewsByAdQuery(adId);

  return {
    reviews: data ?? [],
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}
