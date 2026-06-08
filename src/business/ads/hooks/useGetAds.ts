"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useFetchAdsInfiniteQuery } from "../api";
import { mapCatalogShortItemToCardVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { CatalogItemCardVM, FetchAdsArgs } from "../types";

let lastFetchAdsTraceKey: string | null = null;

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
  const products = (data?.pages.flatMap((page) => page.content) ?? []).map(
    mapCatalogShortItemToCardVM,
  );
  const total = data?.pages[0]?.totalElements ?? 0;
  const uiError = getApiError(error);
  const responseTraceKey = useMemo(
    () =>
      JSON.stringify({
        params,
        skip: options.skip ?? false,
        pages: data?.pages.length ?? 0,
        total,
        productsCount: products.length,
        isError,
        error: uiError,
        hasNextPage: hasNextPage ?? false,
      }),
    [
      data?.pages.length,
      hasNextPage,
      isError,
      options.skip,
      params,
      products.length,
      total,
      uiError,
    ],
  );

  useEffect(() => {
    if (options.skip || isLoading || isFetching) {
      return;
    }
    if (lastFetchAdsTraceKey === responseTraceKey) {
      return;
    }

    lastFetchAdsTraceKey = responseTraceKey;
    console.log("[TRACE][CATALOG][RTK_QUERY] fetchAds state", {
      params,
      skip: options.skip,
      pages: data?.pages.length ?? 0,
      total,
      productsCount: products.length,
      isLoading,
      isFetching,
      isFetchingNextPage,
      isError,
      error: uiError,
      hasNextPage: hasNextPage ?? false,
    });
  }, [
    data?.pages.length,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isLoading,
    options.skip,
    params,
    products.length,
    responseTraceKey,
    total,
    uiError,
  ]);

  const tracedFetchNextPage = useCallback(() => {
    console.log("[TRACE][CATALOG][RTK_QUERY] fetch next page", {
      params,
      currentPages: data?.pages.length ?? 0,
      hasNextPage: hasNextPage ?? false,
    });
    fetchNextPage();
  }, [data?.pages.length, fetchNextPage, hasNextPage, params]);

  return {
    products, // Преобразование short DTO из всех страниц в карточки каталога.
    total, // Берём total из первой страницы ответа.
    isLoading, // Первичная загрузка списка объявлений.
    isFetching, // Любой активный запрос по этому query.
    isFetchingNextPage, // Загрузка следующей страницы infinite query.
    isError, // Флаг ошибки
    error: uiError, // Приводим сырой RTK Query error к единому UI-типу.
    hasNextPage: hasNextPage ?? false, // RTK может вернуть undefined, UI получает boolean.
    fetchNextPage: tracedFetchNextPage, // Метод догрузки следующей страницы.
    refetch, // Метод ручного обновления текущего query.
  };
}
