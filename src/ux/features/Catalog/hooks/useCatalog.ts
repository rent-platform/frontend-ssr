import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CatalogUiItem } from '../types';
import { INITIAL_FILTERS, filtersToSearchParams } from '../utils';
import { ROUTES } from '@/ux/utils';
import {
  closeCatalogFilters,
  patchCatalogFilters,
  resetCatalogFilters,
  saveCatalogScrollY,
  setCatalogFilters,
  setSelectedCatalogItem,
  toggleCatalogFilters,
  useAppDispatch,
  useAppSelector,
} from '@/business/shared';

const BATCH_SIZE = 8;

export type UseCatalogOptions = {
  items?: CatalogUiItem[];
  total?: number;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
};

export function useCatalog({
  items: externalItems,
  total: externalTotal,
  isLoading: externalLoading,
  onLoadMore,
  hasMore: externalHasMore,
}: UseCatalogOptions = {}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.catalog.filters);
  const selectedItemId = useAppSelector((state) => state.catalog.selectedItemId);
  const isFiltersOpen = useAppSelector((state) => state.catalog.isFiltersOpen);
  const [selectedItem, setSelectedItem] = useState<CatalogUiItem | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filteredItems = useMemo(() => externalItems ?? [], [externalItems]);
  const visibleItems = filteredItems;
  const similarItems: CatalogUiItem[] = [];
  const hasMore = externalHasMore ?? false;

  const setFilters = useCallback(
    (nextFilters: typeof INITIAL_FILTERS) => {
      dispatch(setCatalogFilters(nextFilters));
    },
    [dispatch],
  );

  const setSelectedCatalogItemState = useCallback(
    (item: CatalogUiItem | null) => {
      setSelectedItem(item);
      dispatch(setSelectedCatalogItem(item?.id ?? null));
    },
    [dispatch],
  );

  const onCloseFilters = () => dispatch(closeCatalogFilters());
  const onToggleFilters = () => dispatch(toggleCatalogFilters());

  const updateFilters = (patch: Partial<typeof filters>) => {
    console.log('[TRACE][CATALOG][STORE] patch catalog filters', {
      patch,
      previousFilters: filters,
    });
    dispatch(patchCatalogFilters(patch));
  };

  const navigateToSearch = useCallback((nextFilters: typeof INITIAL_FILTERS = filters) => {
    if (isFiltersOpen) dispatch(closeCatalogFilters());
    const qs = filtersToSearchParams(nextFilters);
    router.push(`${ROUTES.search}${qs ? `?${qs}` : ''}`);
  }, [dispatch, filters, isFiltersOpen, router]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current || selectedItem) {
      return undefined;
    }

    const node = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          console.log('[TRACE][CATALOG][UI] infinite scroll sentinel reached', {
            hasMore,
            currentItems: visibleItems.length,
          });
          onLoadMore?.();
        }
      },
      { rootMargin: '0px 0px -120px 0px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, onLoadMore, selectedItem, visibleItems.length]);

  const handleOpenItem = (item: CatalogUiItem) => {
    dispatch(closeCatalogFilters());
    dispatch(setSelectedCatalogItem(item.id));
    dispatch(saveCatalogScrollY(window.scrollY));
    router.push(ROUTES.catalogItem(item.id));
  };

  const handleBackToCatalog = () => {
    setSelectedCatalogItemState(null);
  };

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    filters,
    setFilters,
    selectedItem,
    selectedItemId,
    setSelectedItem: setSelectedCatalogItemState,
    isFiltersOpen,
    isInitialLoading: externalLoading ?? false,
    showScrollTop,
    sentinelRef,
    useMockMode: false,
    externalLoading,
    externalTotal,
    filteredItems,
    visibleItems,
    similarItems,
    hasMore,
    onCloseFilters,
    onToggleFilters,
    updateFilters,
    resetFilters: () => dispatch(resetCatalogFilters()),
    navigateToSearch,
    handleOpenItem,
    handleBackToCatalog,
    scrollToTop,
    BATCH_SIZE,
  };
}
