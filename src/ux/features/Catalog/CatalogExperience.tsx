'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BrandIcon, CatalogHeader } from './components/CatalogHeader';
import { CatalogSearchBar } from './components/CatalogSearchBar';
import { CategoryRail } from './components/CategoryRail';
import { CatalogToolbar } from './components/CatalogToolbar';
import { CatalogCard } from './components/CatalogCard';
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
    setVisibleCount(BATCH_SIZE);
  }, [filters]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) {
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
  }, [filteredItems.length, hasMore]);

  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleOpenItem = (item: CatalogUiItem) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setSelectedItem(null);
  };

  return (
    <div className={styles.page}>
      <CatalogHeader cityLabel={filters.city} />

      <main className={styles.main}>
        <CatalogSearchBar
          filters={filters}
          onChange={updateFilters}
          onResetFilters={() => setFilters(INITIAL_FILTERS)}
        />

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
                  <p className={styles.heroEyebrow}>Аренда вещей рядом</p>
                  <h1>Выбирайте нужные вещи на удобный срок без лишних затрат</h1>
                  <p>
                    Находите технику, инструменты и товары для дома рядом с собой и бронируйте
                    только на тот срок, который действительно нужен.
                  </p>
                </div>

                <div className={styles.heroPromoVisual} aria-hidden="true">
                  <div className={styles.heroVisualStage}>
                    <div className={styles.heroOrbitCenter}>
                      <BrandIcon className={styles.heroCenterBrandSymbol} />
                      <div className={styles.heroOrbitText}>
                        <strong>Арендай</strong>
                        <span>Каталог аренды</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className={styles.businessCard}>
                <h3>Быстрый подбор по ключевым параметрам</h3>
                <p>Используйте фильтры, чтобы быстрее найти подходящее предложение по категории, городу и стоимости.</p>
                <div className={styles.businessGrid}>
                  <span>Популярные категории</span>
                  <span>Город и район</span>
                  <span>Стоимость аренды</span>
                  <span>Удобный срок</span>
                </div>
                <button
                  type="button"
                  className={styles.businessButton}
                  onClick={() => {
                    const catalogSection = document.getElementById('catalog');
                    catalogSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  Перейти к объявлениям
                </button>
              </aside>
            </section>
          </>
        )}

        {selectedItem ? (
          <ProductDetail
            item={selectedItem}
            similarItems={similarItems}
            onBack={handleBackToCatalog}
            onOpenSimilar={handleOpenItem}
          />
        ) : (
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
                  <h3>По выбранным параметрам ничего не найдено</h3>
                  <p>
                    Попробуйте изменить категорию, город или поисковый запрос. Иногда достаточно
                    убрать часть фильтров, чтобы увидеть больше подходящих предложений.
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
                        <p>Прокрутите ниже, чтобы загрузить больше объявлений, или откройте следующую подборку вручную.</p>
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
                      <p className={styles.catalogEndMessage}>Вы посмотрели все доступные объявления.</p>
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