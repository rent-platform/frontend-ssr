"use client";

import { useFetchDealsQuery } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import type { dealsQueryParams } from "@/business/types/entity/deal.types";
import type { DealCardVM } from "@/business/types/view/deal.view";

export interface UseDealsResult {
  deals: DealCardVM[];
  isLoading: boolean; // первая загрузка - нет данных
  isFetching: boolean; // фоновое обновление - данные уже есть
  isError: boolean;
  refetch: () => void;
}

export function useGetDeals(params: dealsQueryParams = {}): UseDealsResult {
  const { data, isLoading, isFetching, isError, refetch } =
    useFetchDealsQuery(params);

  return {
    deals: (data?.deals ?? []).map(mapDealToVM),
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
