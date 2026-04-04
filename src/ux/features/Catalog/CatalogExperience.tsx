'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BrandIcon, CatalogHeader } from './components/CatalogHeader';
import { CatalogSearchBar } from './components/CatalogSearchBar';
import { CategoryRail } from './components/CategoryRail';
import { CatalogFilters } from './components/CatalogFilters';
import { CatalogToolbar } from './components/CatalogToolbar';
import { CatalogCard } from './components/CatalogCard';
import { CatalogSkeletonCard } from './components/CatalogSkeletonCard';
import { ProductDetail } from './components/ProductDetail';
import { mockCatalogItems } from './mockCatalogItems';
import type { CatalogUiItem } from './types';
import { CATEGORY_OPTIONS, INITIAL_FILTERS, applyCatalogFilters } from './utils';
import styles from './Catalog.module.scss';

const BATCH_SIZE = 8;


export function CatalogExperience() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedItem, setSelectedItem] = useState<CatalogUiItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    setCatalogLoading(true);
    setVisibleCount(BATCH_SIZE);

    const timeoutId = window.setTimeout(() => {
      setCatalogLoading(false);
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [filters]);

  useEffect(() => {
    if (!hasMore || catalogLoading || !sentinelRef.current) {
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
  }, [filteredItems.length, hasMore, catalogLoading]);

  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleOpenItem = (item: CatalogUiItem) => {
    setDetailLoading(true);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    window.setTimeout(() => {
      setSelectedItem(item);
      setDetailLoading(false);
    }, 280);
  };

  const handleBackToCatalog = () => {
    setSelectedItem(null);
    setDetailLoading(false);
  };

  return (
    <div className={styles.page}>
      <CatalogHeader cityLabel={filters.city} />

      <main className={styles.main}>
        <CatalogSearchBar filters={filters} onChange={updateFilters} />

        {selectedItem ? null : (
          <>
            <CategoryRail
              categories={CATEGORY_OPTIONS}
              activeCategory={filters.category}
              onCategoryChange={(category) => updateFilters({ category })}
            />

            <section className={styles.hero}>
              <div className={styles.heroPromoBanner}>
                <div className={styles.heroPromoContent}>
                  <p className={styles.heroEyebrow}>Арендай для твоего города</p>
                  <h1>Выбирайте вещи по‑умному и арендуйте только на нужный срок</h1>
                  <p>
                    Вот тут можно чёт придумать  
                  </p>
                </div>
                <div className={styles.heroPromoVisual} aria-hidden="true">
                  <div className={styles.heroVisualStage}>
                    <div className={styles.heroOrbitCenter}>
                      <BrandIcon className={styles.heroCenterBrandSymbol} />
                      <div className={styles.heroOrbitText}>
                        <strong>Арендай</strong>
                        <span>Аренда вещей</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className={styles.businessCard}>
                <h3>Блок для чего нибудь ещё</h3>
                <p>Для каких-нибудь доп сценариев.</p>
                <div className={styles.businessGrid}>
                  <span>бла-бла</span>
                  <span>бла-бла</span>
                  <span>бла-бла</span>
                  <span>бла-бла</span>
                </div>
                <button type="button" className={styles.businessButton}>
                  Искать в другом бла-бла
                </button>
              </aside>
            </section>
          </>
        )}

        {detailLoading ? (
          <section className={styles.detailLoadingState}>
            <div className={styles.detailSkeletonHero} />
            <div className={styles.detailSkeletonGrid}>
              <div className={styles.detailSkeletonMain} />
              <div className={styles.detailSkeletonAside} />
            </div>
          </section>
        ) : selectedItem ? (
          <ProductDetail
            item={selectedItem}
            similarItems={similarItems}
            onBack={handleBackToCatalog}
            onOpenSimilar={handleOpenItem}
          />
        ) : (
          <section id="catalog" className={styles.catalogSection}>
            <CatalogFilters
              filters={filters}
              onChange={updateFilters}
              onReset={() => setFilters(INITIAL_FILTERS)}
            />

            <div className={styles.catalogContent}>
              <CatalogToolbar
                total={filteredItems.length}
                visible={visibleItems.length}
                filters={filters}
                onChange={updateFilters}
              />

              {catalogLoading ? (
                <div className={styles.grid}>
                  {Array.from({ length: 8 }).map((_, index) => (
                    <CatalogSkeletonCard key={index} />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🔎</div>
                  <h3>Ничего не найдено</h3>
                  <p>
                    Попробуй убрать часть фильтров или изменить поисковый запрос. Этот UI-модуль
                    к подключению реальных данных и серверной пагинации.
                  </p>
                  <button type="button" onClick={() => setFilters(INITIAL_FILTERS)}>
                    Сбросить фильтры
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.grid}>
                    {visibleItems.map((item) => (
                      <CatalogCard
                        key={item.id}
                        item={item}
                        pricingMode={filters.pricingMode}
                        onOpen={handleOpenItem}
                      />
                    ))}
                  </div>

                  <div ref={sentinelRef} className={styles.infiniteSentinel} aria-hidden />

                  <div className={styles.loadMoreWrap}>
                    {hasMore ? (
                      <>
                        <p>Бесконечная лента активна — можно докрутить список или загрузить вручную.</p>
                        <button
                          type="button"
                          className={styles.loadMoreButton}
                          onClick={() =>
                            setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredItems.length))
                          }
                        >
                          Показать ещё
                        </button>
                      </>
                    ) : (
                      <p className={styles.catalogEndMessage}>Вы дошли до конца</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
