"use client";

import { useFetchAdsInfiniteQuery } from "@/business/api";
import { mapCatalogItemToCardVM } from "@/business/mappers";
import type { FetchAdsArgs } from "@/business/types/dto/ads.dto";
import type { CatalogItemCardVM } from "@/business/types/view/catalog.view";

// Контракт данных и состояний, который hook отдаёт в UI.
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

// Пользовательский hook объединяет query, маппинг и контракт для UI.
export function useGetAds(params: FetchAdsArgs = {}): UseAdsResult {
  // Вызов RTK Query hook для загрузки списка объявлений.
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
    // Преобразование списка DTO в view-модели карточек.
    products: (data?.pages.flatMap((page) => page.items) ?? []).map(
      mapCatalogItemToCardVM,
    ),
    // Получение общего количества объявлений из первой страницы.
    total: data?.pages[0]?.meta.totalCount ?? 0,
    // Признак первичной загрузки данных.
    isLoading,
    // Признак любого активного запроса.
    isFetching,
    // Признак загрузки следующей страницы.
    isFetchingNextPage,
    // Признак ошибки выполнения запроса.
    isError,
    // Признак наличия следующей страницы.
    hasNextPage: hasNextPage ?? false,
    // Функция догрузки следующей страницы.
    fetchNextPage,
    // Функция принудительного обновления данных.
    refetch,
  };
}
