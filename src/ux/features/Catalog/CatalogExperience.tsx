'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CatalogHeader } from './components/CatalogHeader';
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

const BATCH_SIZE = 6;

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
        .slice(0, 3)
    : [];
  const hasMore = visibleCount < filteredItems.length;

  useEffect(() => {
    setCatalogLoading(true);
    setVisibleCount(BATCH_SIZE);

    const timeoutId = window.setTimeout(() => {
      setCatalogLoading(false);
    }, 550);

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
      { rootMargin: '400px 0px' },
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
    }, 320);
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
              <div className={styles.heroContent}>
                <p className={styles.heroEyebrow}>Каталог аренды</p>
                <h1>Бери вещи тогда, когда они действительно нужны</h1>
                <p>
                  Современный каталог в духе маркетплейса: быстрый поиск, фильтры, карточки,
                  skeleton-состояния и бесконечная лента для сценариев аренды.
                </p>
                <div className={styles.heroStats}>
                  <div>
                    <strong>1 500+</strong>
                    <span>объявлений в активной витрине</span>
                  </div>
                  <div>
                    <strong>15 мин</strong>
                    <span>среднее время ответа владельца</span>
                  </div>
                  <div>
                    <strong>4.9 / 5</strong>
                    <span>рейтинг по повторным арендам</span>
                  </div>
                </div>
              </div>

              <div className={styles.heroPromo}>
                <div className={styles.heroPromoCard}>
                  <span className={styles.heroPromoBadge}>Сегодня в тренде</span>
                  <strong>Техника, инструменты, вещи для путешествий и мероприятий</strong>
                  <p>
                    Авито-подобная витрина, но сфокусированная на шеринг-сценариях: удобный
                    выбор, доверие и прозрачная выдача.
                  </p>
                </div>
              </div>
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
                    Попробуй убрать часть фильтров или изменить поисковый запрос. UI already
                    готов к подключению реальных данных и сторонички пагинации.
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

                  {hasMore ? (
                    <div className={styles.loadMoreWrap}>
                      <p>Бесконечная лента включена — можно и докрутить, и нажать вручную.</p>
                      <button
                        type="button"
                        className={styles.loadMoreButton}
                        onClick={() =>
                          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredItems.length))
                        }
                      >
                        Показать ещё
                      </button>
                    </div>
                  ) : (
                    <div className={styles.feedEnd}>
                      <strong>Лента закончилась</strong>
                      <p>Все найденные объявления уже показаны.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
