import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  mockCatalogItems,
  INITIAL_FILTERS,
  applyCatalogFilters,
  type CatalogUiItem,
  type CatalogFilterState,
} from '../../Catalog';
import { GUEST_ITEM_LIMIT } from '../guestConstants';

export function useGuestExperience() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogUiItem | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  const allFiltered = useMemo(
    () => applyCatalogFilters(mockCatalogItems, filters),
    [filters],
  );

  const totalCount = allFiltered.length;

  const filteredItems = useMemo(
    () => allFiltered.slice(0, GUEST_ITEM_LIMIT),
    [allFiltered],
  );

  const similarItems = useMemo(
    () => selectedItem
      ? mockCatalogItems
          .filter((item) => item.id !== selectedItem.id && item.category === selectedItem.category)
          .slice(0, 3)
      : [],
    [selectedItem],
  );

  const updateFilters = useCallback((patch: Partial<CatalogFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const openAuthModal = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const openItem = useCallback((item: CatalogUiItem) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const backToCatalog = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const toggleFilters = useCallback(() => {
    setIsFiltersOpen((prev) => !prev);
  }, []);

  const closeFilters = useCallback(() => {
    setIsFiltersOpen(false);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setIsFiltersOpen(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showAuthModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAuthModal(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [showAuthModal]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    filters,
    showAuthModal,
    selectedItem,
    showScrollTop,
    isFiltersOpen,
    heroRef,
    filteredItems,
    totalCount,
    similarItems,
    updateFilters,
    openAuthModal,
    closeAuthModal,
    openItem,
    backToCatalog,
    toggleFilters,
    closeFilters,
    resetFilters,
    scrollToTop,
  };
}
