"use client";

import { useFetchReviewsByAdQuery } from "@/business/api";
import type { Review } from "@/business/types/dto/reviews.dto";

export interface UseGetReviewsByAdResult {
  reviews: Review[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useGetReviewsByAd(adId: string): UseGetReviewsByAdResult {
  const { data, isLoading, isFetching, isError, refetch } =
    useFetchReviewsByAdQuery(adId);

  return {
    reviews: data ?? [],
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
