"use client";

import { useGetAds } from "./useGetAds";
import { useInfiniteScroll } from "@/business/hooks/utils/useInfiniteScroll";
import { useFilters } from "@/business/hooks/filters/useFilters";
import { useDebouncedValue } from "@/business/hooks/utils/useDebouncedValue"; // см. ниже

export function useCatalogPage() {
  const { filters } = useFilters();

  const debouncedSearch = useDebouncedValue(filters.search, 400);

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
    search: debouncedSearch || undefined,
    pageSize: 20,
  });

  const { observerRef } = useInfiniteScroll({
    hasNextPage,
    isFetching,
    fetchNextPage,
  });

  return {
    products,
    total,
    isLoading,
    isFetchingNextPage,
    isError,
    observerRef,
    refetch,
  };
}
