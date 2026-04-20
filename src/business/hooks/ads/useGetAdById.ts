"use client";

import { useFetchAdByIdQuery } from "@/business/api";
import { mapCatalogItemToDetailsVM } from "@/business/mappers";
import type { CatalogItemDetailsVM } from "@/business/types/view";

export interface UseGetAdByIdResult {
  product: CatalogItemDetailsVM | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useGetAdById(id: string): UseGetAdByIdResult {
  const { data, isLoading, isFetching, isError, refetch } =
    useFetchAdByIdQuery(id);

  return {
    product: data ? mapCatalogItemToDetailsVM(data) : null,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
