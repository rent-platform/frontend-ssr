"use client";

import { useFetchReviewsByUserQuery } from "@/business/api";
import type { Review } from "@/business/types/dto/reviews.dto";

export interface UseGetReviewsByUserResult {
  reviews: Review[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useGetReviewsByUser(userId: string): UseGetReviewsByUserResult {
  const { data, isLoading, isFetching, isError, refetch } =
    useFetchReviewsByUserQuery(userId);

  return {
    reviews: data ?? [],
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
