"use client";

import { useFetchUserRatingQuery } from "@/business/api";
import type { UserRating } from "@/business/types/dto/reviews.dto";

export interface UseGetUserRatingResult {
  rating: UserRating | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useGetUserRating(userId: string): UseGetUserRatingResult {
  const { data, isLoading, isFetching, isError, refetch } =
    useFetchUserRatingQuery(userId);

  return {
    rating: data ?? null,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
