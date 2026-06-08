"use client";

import { useMemo } from "react";
import { useFetchDealStatusHistoryQuery } from "../api";
import { skipToken } from "@reduxjs/toolkit/query";
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
  dealId: string | null | undefined,
): UseGetDealStatusHistoryResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchDealStatusHistoryQuery(dealId ?? skipToken);
  const history = useMemo(
    () => (data ?? []).map(mapDealStatusHistoryToVM),
    [data],
  );
  const uiError = getApiError(error);

  return {
    history,
    isLoading,
    isFetching,
    isError,
    error: uiError,
    refetch,
  };
}



