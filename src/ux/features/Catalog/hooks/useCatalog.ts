import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { mockCatalogItems } from '../mockCatalogItems';
import type { CatalogUiItem } from '../types';
import { INITIAL_FILTERS, applyCatalogFilters, filtersToSearchParams } from '../utils';
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
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedItem, setSelectedItem] = useState<CatalogUiItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(!externalItems);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
        .slice(0, 3)
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
          if (useMockMode) {
            setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredItems.length));
          } else {
            onLoadMore?.();
          }
        }
      },
      { rootMargin: '360px 0px' },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [filteredItems.length, hasMore, selectedItem]);

  const handleOpenItem = (item: CatalogUiItem) => {
    setIsFiltersOpen(false);
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const itemId = searchParams.get('item');
    if (!itemId || selectedItem) return;
    const source = useMockMode ? mockCatalogItems : (externalItems ?? []);
    const found = source.find((i) => i.id === itemId);
    if (found) {
      setSelectedItem(found);
      window.scrollTo({ top: 0 });
    }
  }, [searchParams]);

  const handleBackToCatalog = () => {
    setSelectedItem(null);
    if (searchParams.get('item')) {
      router.replace(ROUTES.catalog, { scroll: false });
    }
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
    isInitialLoading,
    showScrollTop,
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
    handleOpenItem,
    handleBackToCatalog,
    scrollToTop,
    BATCH_SIZE,
  };
}
