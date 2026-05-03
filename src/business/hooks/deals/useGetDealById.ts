"use client";

import { useFetchDealByIdQuery } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { DealDetailsVM } from "@/business/types";

export interface UseGetDealByIdResult {
  deal: DealDetailsVM | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetDealById(id: string): UseGetDealByIdResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchDealByIdQuery(id);

  return {
    deal: data ? mapDealToVM(data) : null,
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}
