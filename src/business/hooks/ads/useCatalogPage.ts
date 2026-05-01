"use client";

import { useGetAds } from "./useGetAds";
import { useInfiniteScroll } from "@/business/hooks/utils/useInfiniteScroll";
import { useFilters } from "@/business/hooks/filters/useFilters";
import { useDebouncedValue } from "@/business/hooks/utils/useDebouncedValue";

export function useCatalogPage() {
  const { filters } = useFilters(); // Чтение фильтров из URL.

  const debouncedSearch = useDebouncedValue(filters.search, 400); // задержка вызова поисковой строки.

  const {
    products,
    total,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetAds({
    // Загрузка данных каталога.
    search: debouncedSearch || undefined, // Поиск с задержкой.
    pageSize: 20, // Размер страницы выборки.
  });

  const { observerRef } = useInfiniteScroll({
    // Настройка бесконечной прокрутки.
    hasNextPage, // Есть ли следующая страница.
    isFetching, // Идёт ли сейчас загрузка.
    fetchNextPage, // Команда догрузки.
  });

  return {
    products, // Карточки объявлений для UI.
    total, // Общее количество результатов.
    isLoading, // Состояние первичной загрузки.
    isFetchingNextPage, // Состояние догрузки страницы.
    isError, // Признак ошибки запроса.
    observerRef, // Ref наблюдаемого элемента.
    refetch, // Принудительное обновление.
  };
}
