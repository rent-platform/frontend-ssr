'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useMemo } from 'react';
import { ArrowLeft, PackageSearch } from 'lucide-react';
import { ScrollToTop } from '@/ux/components/ScrollToTop';
import Link from 'next/link';
import { CatalogHeader } from '@/ux/layouts/SiteHeader';
import { CatalogSearchBar } from './components/filters/CatalogSearchBar';
import { CatalogToolbar } from './components/filters/CatalogToolbar';
import { CatalogCard } from './components/cards/CatalogCard';
import { ProductDetail } from './components/detail/ProductDetail';
import { CatalogFooter } from '@/ux/layouts/SiteFooter';
import { INITIAL_FILTERS, getFilterSummaryItems } from './utils';
import { ROUTES } from '@/ux/utils';
import { useCatalog } from './hooks/useCatalog';
import styles from './Catalog.module.scss';

export function SearchResultsPage() {
  const {
    filters,
    setFilters,
    selectedItem,
    isFiltersOpen,
    sentinelRef,
    filteredItems,
    visibleItems,
    similarItems,
    hasMore,
    onCloseFilters,
    onToggleFilters,
    updateFilters,
    navigateWithFilters,
    handleOpenItem,
    handleBackToCatalog,
    BATCH_SIZE,
  } = useCatalog({ syncWithSearchParams: true, similarItemsCount: 4 });

  const summaryChips = useMemo(() => getFilterSummaryItems(filters), [filters]);

  const handleSearch = useCallback(() => {
    if (isFiltersOpen) onCloseFilters();
    navigateWithFilters(filters);
  }, [filters, isFiltersOpen, onCloseFilters, navigateWithFilters]);

  const handleFiltersConfirm = useCallback(() => {
    onCloseFilters();
    navigateWithFilters(filters);
  }, [filters, onCloseFilters, navigateWithFilters]);

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
          hideSummary
        />

        {!selectedItem && (
          <>
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
            </div>
            {summaryChips.length > 0 && (
              <div className={styles.activeFiltersRow}>
                {summaryChips.map((item) => (
                  <span key={item} className={styles.activeFilterChip}>{item}</span>
                ))}
              </div>
            )}
          </>
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

      <ScrollToTop className={styles.scrollTopBtn} />
    </div>
  );
}
