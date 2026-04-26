"use client";

import { useFetchDealByIdQuery } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import type { DealDetailsVM } from "@/business/types/view";

export interface UseGetDealByIdResult {
  deal: DealDetailsVM | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useGetDealById(id: string): UseGetDealByIdResult {
  const { data, isLoading, isFetching, isError, refetch } =
    useFetchDealByIdQuery(id);

  return {
    deal: data ? mapDealToVM(data) : null,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
