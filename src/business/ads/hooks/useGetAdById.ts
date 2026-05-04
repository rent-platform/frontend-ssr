"use client";

import { useFetchAdByIdQuery } from "../api";
import { mapCatalogItemToDetailsVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { CatalogItemDetailsVM } from "../types";

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




