"use client";

import { useFetchCatalogQuery } from "@/business/api";
import { mapCatalogItemToVM } from "@/business/mappers";
import type { CatalogQueryParams } from "@/business/types/dto/catalog.dto";
import type { CatalogItemCardVM } from "@/business/types/view/catalog.view";

export interface UseCatalogResult {
  products: CatalogItemCardVM[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useCatalog(params: CatalogQueryParams = {}): UseCatalogResult {
  const { data, isLoading, isError, refetch } = useFetchCatalogQuery(params);

  return {
    products: (data?.items ?? []).map(mapCatalogItemToVM),
    total: data?.total ?? 0,
    isLoading,
    isError,
    refetch,
  };
}
