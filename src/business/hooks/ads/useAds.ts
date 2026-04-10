"use client";

import { useFetchAdsQuery } from "@/business/api";
import { mapCatalogItemToVM } from "@/business/mappers";
import type { CatalogQueryParams } from "@/business/types/dto/catalog.dto";
import type { CatalogItemCardVM } from "@/business/types/view/catalog.view";

export interface UseAdsResult {
  products: CatalogItemCardVM[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useAds(params: CatalogQueryParams = {}): UseAdsResult {
  const { data, isLoading, isError, refetch } = useFetchAdsQuery(params);

  return {
    products: (data?.items ?? []).map(mapCatalogItemToVM),
    total: data?.total ?? 0,
    isLoading,
    isError,
    refetch,
  };
}
