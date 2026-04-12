'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CatalogHeader } from './components/CatalogHeader';
import { CatalogSearchBar } from './components/CatalogSearchBar';
import { CatalogFilters } from './components/CatalogFilters';
import { CategoryRail } from './components/CategoryRail';
import { CatalogToolbar } from './components/CatalogToolbar';
import { CatalogCard } from './components/CatalogCard';
import { ProductDetail } from './components/ProductDetail';
import { CatalogSkeletonCard } from './components/CatalogSkeletonCard';
import { mockCatalogItems } from './mockCatalogItems';
import type { CatalogUiItem } from './types';
import { CATEGORY_OPTIONS, INITIAL_FILTERS, applyCatalogFilters } from './utils';
import styles from './Catalog.module.scss';

const BATCH_SIZE = 8;

export function CatalogExperience() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedItem, setSelectedItem] = useState<CatalogUiItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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

  useEffect(() => {
    if (!hasMore || !sentinelRef.current || selectedItem) {
      return undefined;
    }

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

  const handleBackToCatalog = () => {
    setSelectedItem(null);
  };

  if (isInitialLoading) {
    return (
      <div className={styles.page}>
        <CatalogHeader cityLabel={filters.city} />
        <main className={styles.main}>
          <div className={styles.loadingShell}>
            <div className={styles.loadingHero} />
            <div className={styles.loadingGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <CatalogSkeletonCard key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <CatalogHeader cityLabel={filters.city} />

      <main className={styles.main}>
        <CatalogSearchBar
          filters={filters}
          resultsCount={filteredItems.length}
          isFiltersOpen={isFiltersOpen}
          onToggleFilters={onToggleFilters}
          onCloseFilters={onCloseFilters}
          onChange={updateFilters}
          onResetFilters={() => setFilters(INITIAL_FILTERS)}
        />

        {selectedItem ? null : (
          <>
            <header className={styles.hero}>
              <motion.div 
                className={styles.heroGlassCard}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className={styles.heroContent}>
                  <span className={styles.eyebrow}>
                    Sharing Economy
                  </span>
                  <h1 className={styles.title}>Берите в аренду то, что нужно сейчас</h1>
                  <p className={styles.subtitle}>
                    Инструменты, техника и товары для досуга в вашем городе.
                  </p>
                  
                  <div className={styles.stats}>
                    <div className={styles.statCard}>
                      <strong>{mockCatalogItems.length}</strong>
                      <span>Объявлений</span>
                    </div>
                    <div className={styles.statCard}>
                      <strong>{CATEGORY_OPTIONS.length}</strong>
                      <span>Категорий</span>
                    </div>
                    <div className={styles.statCard}>
                      <strong>24/7</strong>
                      <span>Поддержка</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </header>

            <CategoryRail
              categories={CATEGORY_OPTIONS}
              activeCategory={filters.category}
              onCategoryChange={(category) => updateFilters({ category })}
            />
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
            key="catalog-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <section id="catalog-results" className={isFiltersOpen ? styles.catalogLayout : styles.catalogLayoutClosed}>
              <AnimatePresence>
                {isFiltersOpen && (
                  <CatalogFilters
                    filters={filters}
                    resultsCount={filteredItems.length}
                    onChange={updateFilters}
                    onReset={() => setFilters(INITIAL_FILTERS)}
                    onClose={onCloseFilters}
                  />
                )}
              </AnimatePresence>

              <div className={styles.content}>
                <CatalogToolbar
                  resultsCount={filteredItems.length}
                  visibleCount={visibleItems.length}
                  filters={filters}
                  onChange={updateFilters}
                  onToggleFilters={onToggleFilters}
                  isFiltersOpen={isFiltersOpen}
                />

                <div className={styles.resultsGrid}>
                  {visibleItems.length > 0 ? (
                    visibleItems.map((item) => (
                      <CatalogCard
                        key={item.id}
                        item={item}
                        onOpen={handleOpenItem}
                      />
                    ))
                  ) : (
                    <div className={styles.emptyState}>
                      <h3>Ничего не нашли</h3>
                      <p>Попробуйте изменить параметры поиска или фильтры</p>
                      <button 
                        className={styles.resetBtn}
                        onClick={() => updateFilters({ search: '', city: '', category: '' })}
                      >
                        Сбросить всё
                      </button>
                    </div>
                  )}

                  {hasMore && (
                    <div ref={sentinelRef} className={styles.infiniteSentinel} />
                  )}
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
}
