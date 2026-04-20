"use client";

import { useFetchAdsInfiniteQuery } from "@/business/api";
import { mapCatalogItemToCardVM } from "@/business/mappers";
import type { FetchAdsArgs } from "@/business/types/dto/ads.dto";
import type { CatalogItemCardVM } from "@/business/types/view/catalog.view";

export interface UseAdsResult {
  products: CatalogItemCardVM[];
  total: number;
  isLoading: boolean; // первая загрузка
  isFetching: boolean; // любой запрос
  isFetchingNextPage: boolean; // догрузка следующей страницы
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

export function useGetAds(params: FetchAdsArgs = {}): UseAdsResult {
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useFetchAdsInfiniteQuery(params);

  return {
    products: (data?.pages.flatMap((page) => page.items) ?? []).map(
      mapCatalogItemToCardVM,
    ),
    total: data?.pages[0]?.meta.totalCount ?? 0,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    refetch,
  };
}
