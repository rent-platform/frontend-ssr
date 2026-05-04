"use client";

import { useFetchMyOutgoingDealsQuery } from "../api";
import { mapDealToVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { DealCardVM } from "../types";

export interface UseGetOutgoingDealsResult {
  deals: DealCardVM[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetOutgoingDeals(): UseGetOutgoingDealsResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchMyOutgoingDealsQuery();

  return {
    deals: (data?.deals ?? []).map(mapDealToVM),
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}



