"use client";

import { useFetchMyOutgoingDealsQuery } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import type { DealCardVM } from "@/business/types/view";

export interface UseGetOutgoingDealsResult {
  deals: DealCardVM[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useGetOutgoingDeals(): UseGetOutgoingDealsResult {
  const { data, isLoading, isFetching, isError, refetch } =
    useFetchMyOutgoingDealsQuery();

  return {
    deals: (data?.deals ?? []).map(mapDealToVM),
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
