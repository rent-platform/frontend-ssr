'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowUp, PackageSearch } from 'lucide-react';
import Link from 'next/link';
import { CatalogHeader } from './components/CatalogHeader';
import { CatalogSearchBar } from './components/CatalogSearchBar';
import { CatalogToolbar } from './components/CatalogToolbar';
import { CatalogCard } from './components/CatalogCard';
import { ProductDetail } from './components/ProductDetail';
import { CatalogSkeletonCard } from './components/CatalogSkeletonCard';
import { CatalogFooter } from './components/CatalogFooter';
import { mockCatalogItems } from './mockCatalogItems';
import type { CatalogUiItem } from './types';
import {
  INITIAL_FILTERS,
  applyCatalogFilters,
  searchParamsToFilters,
  filtersToSearchParams,
} from './utils';
import { ROUTES, pluralize } from '@/ux/utils';
import styles from './Catalog.module.scss';

const BATCH_SIZE = 8;

export function SearchResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(() => searchParamsToFilters(searchParams));
  const [selectedItem, setSelectedItem] = useState<CatalogUiItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFilters(searchParamsToFilters(searchParams));
    setVisibleCount(BATCH_SIZE);
  }, [searchParams]);

  const filteredItems = useMemo(
    () => applyCatalogFilters(mockCatalogItems, filters),
    [filters],
  );

  const visibleItems = filteredItems.slice(0, visibleCount);

  const similarItems = selectedItem
    ? mockCatalogItems
        .filter((item) => item.id !== selectedItem.id && item.category === selectedItem.category)
        .slice(0, 4)
    : [];

  const hasMore = visibleCount < filteredItems.length;

  const onCloseFilters = () => setIsFiltersOpen(false);
  const onToggleFilters = () => setIsFiltersOpen(!isFiltersOpen);

  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setVisibleCount(BATCH_SIZE);
  };

  const navigateWithFilters = useCallback(
    (currentFilters: typeof filters) => {
      const qs = filtersToSearchParams(currentFilters);
      router.push(`${ROUTES.search}${qs ? `?${qs}` : ''}`);
    },
    [router],
  );

  const handleSearch = useCallback(() => {
    if (isFiltersOpen) setIsFiltersOpen(false);
    navigateWithFilters(filters);
  }, [filters, isFiltersOpen, navigateWithFilters]);

  const handleFiltersConfirm = useCallback(() => {
    setIsFiltersOpen(false);
    navigateWithFilters(filters);
  }, [filters, navigateWithFilters]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current || selectedItem) return undefined;
    const node = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredItems.length));
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

  const handleBackToCatalog = () => setSelectedItem(null);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={styles.page}>
      <CatalogHeader cityLabel={filters.city} isHidden={isFiltersOpen} />

      <main className={styles.main}>
        <CatalogSearchBar
          filters={filters}
          resultsCount={filteredItems.length}
          isFiltersOpen={isFiltersOpen}
          onToggleFilters={onToggleFilters}
          onCloseFilters={onCloseFilters}
          onChange={updateFilters}
          onResetFilters={() => setFilters(INITIAL_FILTERS)}
          onSearch={handleSearch}
          onFiltersConfirm={handleFiltersConfirm}
        />

        {!selectedItem && (
          <div className={styles.searchResultsHeader}>
            <Link href={ROUTES.home} className={styles.backLink}>
              <ArrowLeft size={16} />
              <span>На главную</span>
            </Link>
            <h2 className={styles.searchResultsTitle}>
              {filters.search.trim()
                ? <>Результаты по запросу «{filters.search.trim()}»</>
                : 'Результаты поиска'}
            </h2>
            <span className={styles.searchResultsCount}>
              {filteredItems.length} {pluralize(filteredItems.length, 'объявление', 'объявления', 'объявлений')}
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {selectedItem ? (
            <motion.div
              key="product-detail"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ProductDetail
                item={selectedItem}
                similarItems={similarItems}
                onBack={handleBackToCatalog}
                onOpenSimilar={handleOpenItem}
              />
            </motion.div>
          ) : (
            <motion.div
              key="search-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <section id="catalog-results" className={styles.catalogLayoutClosed}>
                <div className={styles.content}>
                  <CatalogToolbar
                    filters={filters}
                    onChange={updateFilters}
                    visibleCount={visibleItems.length}
                    totalCount={filteredItems.length}
                  />

                  {visibleItems.length > 0 ? (
                    <div className={styles.resultsGrid}>
                      {visibleItems.map((item) => (
                        <CatalogCard key={item.id} item={item} onOpen={handleOpenItem} />
                      ))}
                      {hasMore ? (
                        <div ref={sentinelRef} className={styles.infiniteSentinel} />
                      ) : visibleItems.length > BATCH_SIZE ? (
                        <div className={styles.endCap}>Вы просмотрели все объявления</div>
                      ) : null}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyStateIcon}>
                        <PackageSearch size={28} />
                      </div>
                      <h3>Ничего не нашли</h3>
                      <p>Попробуйте изменить параметры поиска или фильтры</p>
                      <button
                        type="button"
                        className={styles.emptyStateBtn}
                        onClick={() => {
                          setFilters(INITIAL_FILTERS);
                          navigateWithFilters(INITIAL_FILTERS);
                        }}
                      >
                        Сбросить всё
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CatalogFooter />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            type="button"
            className={styles.scrollTopBtn}
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            aria-label="Наверх"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
