"use client";

import { useFetchAdsInfiniteQuery } from "../api";
import { mapCatalogShortItemToCardVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { CatalogItemCardVM, FetchAdsArgs } from "../types";

// Контракт данных и состояний, который hook отдаёт в UI.
export interface UseAdsResult {
  products: CatalogItemCardVM[]; // Карточки объявлений в формате, удобном для UI.
  total: number; // Общее количество объявлений по ответу первой страницы.
  isLoading: boolean; // Первая загрузка, когда данных ещё нет.
  isFetching: boolean; // Любой активный запрос: первичный, refetch или догрузка.
  isFetchingNextPage: boolean; // Отдельный флаг догрузки следующей страницы.
  isError: boolean; // Признак ошибки запроса.
  error: ApiUiError | null; // Нормализованная ошибка для отображения в UI.
  hasNextPage: boolean; // Есть ли следующая страница для infinite scroll.
  fetchNextPage: () => void; // Запускает догрузку следующей страницы.
  refetch: () => void; // Повторяет текущий запрос вручную.
}

export function useGetAds(
  params: FetchAdsArgs = {},
  options: { skip?: boolean } = {},
): UseAdsResult {
  // Вызов RTK Query hook для загрузки списка объявлений.
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useFetchAdsInfiniteQuery(params, { skip: options.skip });

  return {
    products: (data?.pages.flatMap((page) => page.content) ?? []).map(
      mapCatalogShortItemToCardVM,
    ), // Преобразование short DTO из всех страниц в карточки каталога.
    total: data?.pages[0]?.totalElements ?? 0, // Берём total из первой страницы ответа.
    isLoading, // Первичная загрузка списка объявлений.
    isFetching, // Любой активный запрос по этому query.
    isFetchingNextPage, // Загрузка следующей страницы infinite query.
    isError, // Флаг ошибки
    error: getApiError(error), // Приводим сырой RTK Query error к единому UI-типу.
    hasNextPage: hasNextPage ?? false, // RTK может вернуть undefined, UI получает boolean.
    fetchNextPage, // Метод догрузки следующей страницы.
    refetch, // Метод ручного обновления текущего query.
  };
}
