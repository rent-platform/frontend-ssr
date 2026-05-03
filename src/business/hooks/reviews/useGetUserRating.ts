"use client";

import { useFetchUserRatingQuery } from "@/business/api";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { UserRating } from "@/business/types";

export interface UseGetUserRatingResult {
  rating: UserRating | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetUserRating(userId: string): UseGetUserRatingResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchUserRatingQuery(userId);

  return {
    rating: data ?? null,
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}
