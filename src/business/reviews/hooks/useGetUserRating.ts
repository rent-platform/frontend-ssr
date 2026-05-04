"use client";

import { useFetchUserRatingQuery } from "../api";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { UserRating } from "../types";

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



