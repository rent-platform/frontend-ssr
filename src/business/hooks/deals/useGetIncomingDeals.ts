"use client";

import { useFetchMyIncomingDealsQuery } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import type { DealCardVM } from "@/business/types/view";

export interface UseGetIncomingDealsResult {
  deals: DealCardVM[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useGetIncomingDeals(): UseGetIncomingDealsResult {
  const { data, isLoading, isFetching, isError, refetch } =
    useFetchMyIncomingDealsQuery();

  return {
    deals: (data?.deals ?? []).map(mapDealToVM),
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
