"use client";

import { useEffect, useMemo, useRef } from "react";
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

type UseGetItemAvailabilityOptions = {
  skip?: boolean;
  traceEnabled?: boolean;
};

export function useGetItemAvailability(
  itemId: string,
  startDate: string,
  endDate: string,
  options: UseGetItemAvailabilityOptions = {},
): UseGetItemAvailabilityResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchItemAvailabilityQuery(
      { itemId, startDate, endDate },
      { skip: options.skip || !itemId || !startDate || !endDate },
    );
  const uiError = useMemo(() => getApiError(error), [error]);
  const lastTraceKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const skip = options.skip || options.traceEnabled !== true || !itemId || !startDate || !endDate;
    if (skip || isLoading || isFetching) {
      return;
    }

    const slotsCount = data?.length ?? 0;
    const unavailableCount = data?.filter((slot) => !slot.isAvailable).length ?? 0;
    const traceKey = JSON.stringify({
      itemId,
      startDate,
      endDate,
      slotsCount,
      unavailableCount,
      isError,
      error: uiError?.message ?? null,
    });

    if (lastTraceKeyRef.current === traceKey) {
      return;
    }
    lastTraceKeyRef.current = traceKey;

    console.log("[TRACE][RENT_PAYMENT][AVAILABILITY] month availability loaded", {
      itemId,
      startDate,
      endDate,
      slotsCount,
      unavailableCount,
      isError,
      error: uiError,
    });
  }, [
    data,
    endDate,
    isError,
    isFetching,
    isLoading,
    itemId,
    options.skip,
    options.traceEnabled,
    startDate,
    uiError,
  ]);

  return {
    availability: data ?? [],
    isLoading,
    isFetching,
    isError,
    error: uiError,
    refetch,
  };
}
