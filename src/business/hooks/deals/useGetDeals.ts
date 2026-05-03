"use client";

import { useFetchDealsQuery } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { DealCardVM, FetchDealsArgs } from "@/business/types";

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
