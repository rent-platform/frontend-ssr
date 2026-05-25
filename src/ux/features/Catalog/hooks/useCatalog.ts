import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CatalogUiItem } from '../types';
import { INITIAL_FILTERS, filtersToSearchParams } from '../utils';
import { ROUTES } from '@/ux/utils';

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
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedItem, setSelectedItem] = useState<CatalogUiItem | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const filteredItems = useMemo(() => externalItems ?? [], [externalItems]);
  const visibleItems = filteredItems;
  const similarItems: CatalogUiItem[] = [];
  const hasMore = externalHasMore ?? false;

  const onCloseFilters = () => setIsFiltersOpen(false);
  const onToggleFilters = () => setIsFiltersOpen(!isFiltersOpen);

  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const navigateToSearch = useCallback(() => {
    if (isFiltersOpen) setIsFiltersOpen(false);
    const qs = filtersToSearchParams(filters);
    router.push(`${ROUTES.search}${qs ? `?${qs}` : ''}`);
  }, [filters, isFiltersOpen, router]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current || selectedItem) {
      return undefined;
    }

    const node = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore?.();
        }
      },
      { rootMargin: '360px 0px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [hasMore, onLoadMore, selectedItem]);

  const handleOpenItem = (item: CatalogUiItem) => {
    setIsFiltersOpen(false);
    router.push(ROUTES.catalogItem(item.id));
  };

  const handleBackToCatalog = () => {
    setSelectedItem(null);
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
    setSelectedItem,
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
    navigateToSearch,
    handleOpenItem,
    handleBackToCatalog,
    scrollToTop,
    BATCH_SIZE,
  };
}
