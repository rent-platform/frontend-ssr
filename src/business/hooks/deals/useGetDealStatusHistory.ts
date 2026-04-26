"use client";

import { useFetchDealStatusHistoryQuery } from "@/business/api";
import { mapDealStatusHistoryToVM } from "@/business/mappers";
import type { DealStatusHistoryItemVM } from "@/business/types/view";

export interface UseGetDealStatusHistoryResult {
  history: DealStatusHistoryItemVM[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useGetDealStatusHistory(
  dealId: string,
): UseGetDealStatusHistoryResult {
  const { data, isLoading, isFetching, isError, refetch } =
    useFetchDealStatusHistoryQuery(dealId);

  return {
    history: (data ?? []).map(mapDealStatusHistoryToVM),
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
