"use client";

import { useGetAds } from "./useGetAds";
import { useInfiniteScroll } from "@/business/shared";
import { useDebouncedValue } from "@/business/shared";
import type { FetchAdsArgs } from "../types";

export function useCatalogPage(
  params: FetchAdsArgs = {},
  options: { skip?: boolean } = {},
) {
  const search = params.search ?? "";
  const debouncedSearch = useDebouncedValue(search, 400); // Не отправляем запрос на каждый ввод символа.

  const {
    products,
    total,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetAds(
    {
      ...params,
      search: debouncedSearch || undefined,
      pageSize: params.pageSize ?? 20,
    },
    options,
  );

  const { observerRef } = useInfiniteScroll({
    hasNextPage, // Запускаем observer только если есть следующая страница.
    isFetching, // Блокируем повторный вызов, пока текущий запрос активен.
    fetchNextPage, // Команда RTK Query для догрузки следующей страницы.
  });

  return {
    products, // Карточки объявлений, уже приведённые к view-model.
    total, // Общее количество найденных объявлений.
    isLoading, // Первичная загрузка каталога без готовых данных.
    isFetchingNextPage, // Догрузка следующей страницы в infinite scroll.
    isError, // Флаг ошибки запроса каталога.
    error, // Нормализованная ошибка для UI; уже обработана в useGetAds.
    hasNextPage, // Есть ли следующая страница.
    fetchNextPage, // Команда догрузки следующей страницы.
    observerRef, // Ref sentinel-элемента, за которым следит IntersectionObserver.
    refetch, // Ручное повторное получение текущей выборки.
  };
}
