"use client";

import { useFetchAdsQuery } from "@/business/api";
import { mapCatalogItemToVM } from "@/business/mappers";
import type { AdsQueryParams } from "@/business/types/dto/ads.dto";
import type { CatalogItemCardVM } from "@/business/types/view/catalog.view";

export interface UseAdsResult {
  products: CatalogItemCardVM[];
  total: number;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useAds(params: AdsQueryParams = {}): UseAdsResult {
  const {
    data,
    isLoading: isFetching,
    isError,
    refetch,
  } = useFetchAdsQuery(params);

  return {
    products: (data?.items ?? []).map(mapCatalogItemToVM),
    total: data?.total ?? 0,
    isFetching,
    isError,
    refetch,
  };
}
