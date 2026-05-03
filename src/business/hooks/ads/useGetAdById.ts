"use client";

import { useFetchAdByIdQuery } from "@/business/api";
import { mapCatalogItemToDetailsVM } from "@/business/mappers";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { CatalogItemDetailsVM } from "@/business/types";

export interface UseGetAdByIdResult {
  product: CatalogItemDetailsVM | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetAdById(id: string): UseGetAdByIdResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchAdByIdQuery(id);

  return {
    product: data ? mapCatalogItemToDetailsVM(data) : null,
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}
