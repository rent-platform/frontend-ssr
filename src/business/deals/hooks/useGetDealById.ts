"use client";

import { useFetchDealByIdQuery } from "../api";
import { mapDealToVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { DealDetailsVM } from "../types";

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



