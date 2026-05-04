"use client";

import { useFetchDealStatusHistoryQuery } from "../api";
import { mapDealStatusHistoryToVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { DealStatusHistoryItemVM } from "../types";

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



