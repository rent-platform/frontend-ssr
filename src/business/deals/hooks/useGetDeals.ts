"use client";

import { useFetchDealsQuery } from "../api";
import { mapDealToVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { DealCardVM, FetchDealsArgs } from "../types";

export interface UseDealsResult {
  deals: DealCardVM[];
  isLoading: boolean; // первая загрузка - нет данных
  isFetching: boolean; // фоновое обновление - данные уже есть
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetDeals(params: FetchDealsArgs = {}): UseDealsResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchDealsQuery(params);

  return {
    deals: (data?.deals ?? []).map(mapDealToVM),
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}




