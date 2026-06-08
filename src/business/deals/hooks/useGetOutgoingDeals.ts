"use client";

import { useFetchMyOutgoingDealsQuery } from "../api";
import { useMemo } from "react";
import { mapDealToVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { DealCardVM, FetchDealsArgs } from "../types";

export interface UseGetOutgoingDealsResult {
  deals: DealCardVM[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetOutgoingDeals(params: FetchDealsArgs = {}): UseGetOutgoingDealsResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchMyOutgoingDealsQuery(params);
  const deals = useMemo(
    () => (data?.content ?? []).map(mapDealToVM),
    [data?.content],
  );
  const uiError = useMemo(() => getApiError(error), [error]);

  return {
    deals,
    isLoading,
    isFetching,
    isError,
    error: uiError,
    refetch,
  };
}



