"use client";

import { useFetchDealStatusHistoryQuery } from "@/business/api";
import { mapDealStatusHistoryToVM } from "@/business/mappers";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { DealStatusHistoryItemVM } from "@/business/types";

export interface UseGetDealStatusHistoryResult {
  history: DealStatusHistoryItemVM[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetDealStatusHistory(
  dealId: string,
): UseGetDealStatusHistoryResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchDealStatusHistoryQuery(dealId);

  return {
    history: (data ?? []).map(mapDealStatusHistoryToVM),
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}
