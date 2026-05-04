"use client";

import { useFetchReviewsByUserQuery } from "../api";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { ReviewDTO } from "../types";

export interface UseGetReviewsByUserResult {
  reviews: ReviewDTO[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetReviewsByUser(userId: string): UseGetReviewsByUserResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchReviewsByUserQuery(userId);

  return {
    reviews: data ?? [],
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}



