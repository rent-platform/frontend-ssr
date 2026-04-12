'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BrandIcon, CatalogHeader } from './components/CatalogHeader';
import { CatalogSearchBar } from './components/CatalogSearchBar';
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
          onToggleFilters={() => setIsFiltersOpen((prev) => !prev)}
          onCloseFilters={() => setIsFiltersOpen(false)}
          onChange={updateFilters}
          onResetFilters={() => setFilters(INITIAL_FILTERS)}
        />

        {selectedItem ? null : (
          <>
            <section className={styles.hero}>
              <div className={styles.heroPromoBanner}>
                <div className={styles.heroPromoContent}>
                  <div className={styles.heroEyebrow}>Sharing Economy</div>
                  <h1>Берите в аренду то, что нужно сейчас</h1>
                  <p>
                    Инструменты, техника и товары для досуга в вашем городе.
                  </p>
                </div>
              </div>
            </section>

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
            <section id="catalog" className={styles.catalogContentOnly}>
              <div className={styles.catalogContent}>
                <CatalogToolbar
                  total={filteredItems.length}
                  visible={visibleItems.length}
                  filters={filters}
                  onChange={updateFilters}
                />

                {filteredItems.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔎</div>
                    <h3>Ничего не найдено</h3>
                    <p>
                      Попробуйте изменить категорию, город или поисковый запрос.
                    </p>
                    <button type="button" onClick={() => setFilters(INITIAL_FILTERS)}>
                      Сбросить фильтры
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.grid}>
                      <AnimatePresence mode="popLayout">
                        {visibleItems.map((item, index) => (
                          <CatalogCard
                            key={item.id}
                            item={item}
                            index={index}
                            onOpen={handleOpenItem}
                          />
                        ))}
                      </AnimatePresence>
                    </div>

                    {hasMore && (
                      <div ref={sentinelRef} className={styles.infiniteSentinel} />
                    )}
                  </>
                )}
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
}
