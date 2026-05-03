"use client";

import { useFetchMyIncomingDealsQuery } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { DealCardVM } from "@/business/types";

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
    deals: (data?.deals ?? []).map(mapDealToVM),
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}
