"use client";

import { useFetchItemAvailabilityQuery } from "../api";
import { getApiError, type ApiUiError } from "@/business/shared";
import type { AvailabilityResponseDto } from "../types";

export interface UseGetItemAvailabilityResult {
  availability: AvailabilityResponseDto[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetItemAvailability(
  itemId: string,
  startDate: string,
  endDate: string,
  options: { skip?: boolean } = {},
): UseGetItemAvailabilityResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchItemAvailabilityQuery(
      { itemId, startDate, endDate },
      { skip: options.skip || !itemId || !startDate || !endDate },
    );

  return {
    availability: data ?? [],
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}
