"use client";

import { useFetchUserReviewSummaryQuery } from "../api";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { UserRatingSummaryDTO } from "../types";

export interface UseGetUserRatingResult {
  rating: UserRatingSummaryDTO | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetUserRating(userId: string): UseGetUserRatingResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchUserReviewSummaryQuery(userId);

  return {
    rating: data ?? null,
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}



