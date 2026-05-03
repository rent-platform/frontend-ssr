"use client";

import { useFetchReviewsByUserQuery } from "@/business/api";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { ReviewDTO } from "@/business/types";

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
