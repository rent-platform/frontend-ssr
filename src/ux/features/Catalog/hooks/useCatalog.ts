import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mockCatalogItems } from '../mockCatalogItems';
import type { CatalogUiItem, CatalogFilterState } from '../types';
import { INITIAL_FILTERS, applyCatalogFilters, filtersToSearchParams, searchParamsToFilters } from '../utils';
import { ROUTES } from '@/ux/utils';
import { useInfiniteScroll } from '@/ux/hooks';

const BATCH_SIZE = 8;

export type UseCatalogOptions = {
  items?: CatalogUiItem[];
  total?: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  /** When true, initializes filters from URL search params and re-syncs on param changes. */
  syncWithSearchParams?: boolean;
  /** Number of similar items to show (default 3). */
  similarItemsCount?: number;
};

export function useCatalog({
  items: externalItems,
  total: externalTotal,
  isLoading: externalLoading,
  onLoadMore,
  hasMore: externalHasMore,
  syncWithSearchParams = false,
  similarItemsCount = 3,
}: UseCatalogOptions = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CatalogFilterState>(
    () => syncWithSearchParams ? searchParamsToFilters(searchParams) : INITIAL_FILTERS,
  );
  const [selectedItem, setSelectedItem] = useState<CatalogUiItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(!externalItems);

  const useMockMode = !externalItems;

  useEffect(() => {
    if (!useMockMode) return undefined;
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, [useMockMode]);

  const filteredItems = useMemo(
    () => useMockMode ? applyCatalogFilters(mockCatalogItems, filters) : externalItems!,
    [useMockMode, externalItems, filters],
  );

  const visibleItems = useMockMode ? filteredItems.slice(0, visibleCount) : filteredItems;

  const similarItems = selectedItem
    ? mockCatalogItems
        .filter((item) => item.id !== selectedItem.id && item.category === selectedItem.category)
        .slice(0, similarItemsCount)
    : [];

  const hasMore = useMockMode
    ? visibleCount < filteredItems.length
    : (externalHasMore ?? false);

  const onCloseFilters = () => setIsFiltersOpen(false);
  const onToggleFilters = () => setIsFiltersOpen(!isFiltersOpen);

  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setVisibleCount(BATCH_SIZE);
  };

  useEffect(() => {
    if (!syncWithSearchParams) return;
    setFilters(searchParamsToFilters(searchParams));
    setVisibleCount(BATCH_SIZE);
  }, [syncWithSearchParams, searchParams]);

  const navigateToSearch = useCallback(() => {
    if (isFiltersOpen) setIsFiltersOpen(false);
    const qs = filtersToSearchParams(filters);
    router.push(`${ROUTES.search}${qs ? `?${qs}` : ''}`);
  }, [filters, isFiltersOpen, router]);

  const navigateWithFilters = useCallback(
    (currentFilters: CatalogFilterState) => {
      const qs = filtersToSearchParams(currentFilters);
      router.push(`${ROUTES.search}${qs ? `?${qs}` : ''}`);
    },
    [router],
  );

  const handleLoadMore = useCallback(() => {
    if (useMockMode) {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredItems.length));
    } else {
      onLoadMore?.();
    }
  }, [useMockMode, filteredItems.length, onLoadMore]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    onLoadMore: handleLoadMore,
    disabled: !!selectedItem,
  });

  const handleOpenItem = (item: CatalogUiItem) => {
    setIsFiltersOpen(false);
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (syncWithSearchParams) return;
    const itemId = searchParams.get('item');
    if (!itemId || selectedItem) return;
    const source = useMockMode ? mockCatalogItems : (externalItems ?? []);
    const found = source.find((i) => i.id === itemId);
    if (found) {
      setSelectedItem(found);
      window.scrollTo({ top: 0 });
    }
  }, [searchParams, syncWithSearchParams]);

  const handleBackToCatalog = () => {
    setSelectedItem(null);
    if (!syncWithSearchParams && searchParams.get('item')) {
      router.replace(ROUTES.catalog, { scroll: false });
    }
  };

  return {
    filters,
    setFilters,
    selectedItem,
    setSelectedItem,
    isFiltersOpen,
    isInitialLoading,
    sentinelRef,
    useMockMode,
    externalLoading,
    externalTotal,
    filteredItems,
    visibleItems,
    similarItems,
    hasMore,
    onCloseFilters,
    onToggleFilters,
    updateFilters,
    navigateToSearch,
    navigateWithFilters,
    handleOpenItem,
    handleBackToCatalog,
    BATCH_SIZE,
  };
}
