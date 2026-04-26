"use client";

import { useCreateReviewMutation } from "@/business/api";
import type { CreateReviewRequest, Review } from "@/business/types/dto/reviews.dto";

export interface UseCreateReviewResult {
  createReview: (payload: CreateReviewRequest) => Promise<unknown>;
  review: Review | null;
  isCreating: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useCreateReview(): UseCreateReviewResult {
  const [createReviewMutation, { data, isLoading, isError, isSuccess, reset }] =
    useCreateReviewMutation();

  return {
    createReview: (payload) => createReviewMutation(payload),
    review: data ?? null,
    isCreating: isLoading,
    isError,
    isSuccess,
    reset,
  };
}
