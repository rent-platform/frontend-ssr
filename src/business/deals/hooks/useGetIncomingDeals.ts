"use client";

import { useFetchMyIncomingDealsQuery } from "../api";
import { mapDealToVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { DealCardVM } from "../types";

export interface UseGetIncomingDealsResult {
  deals: DealCardVM[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetIncomingDeals(): UseGetIncomingDealsResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchMyIncomingDealsQuery();

  return {
    deals: (data?.content ?? []).map(mapDealToVM),
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}



