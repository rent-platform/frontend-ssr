"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, PackageSearch } from "lucide-react";
import { useCatalogPage, useGetAdById } from "@/business/ads";
import { CatalogHeader } from "./components/CatalogHeader";
import { CatalogSearchBar } from "./components/CatalogSearchBar";
import { CategoryRail } from "./components/CategoryRail";
import { CatalogToolbar } from "./components/CatalogToolbar";
import { CatalogCard } from "./components/CatalogCard";
import { ProductDetail } from "./components/ProductDetail";
import { CatalogSkeletonCard } from "./components/CatalogSkeletonCard";
import { CatalogFooter } from "./components/CatalogFooter";
/*
import { mockCatalogItems } from "./mockCatalogItems";
*/
import type { CatalogUiItem } from "./types";
import { mapDetailsVMToUiItem } from "./mappers";
import {
  CATEGORY_OPTIONS,
  INITIAL_FILTERS,
  filtersToSearchParams,
} from "./utils";
import { ROUTES } from "@/ux/utils";
import styles from "./Catalog.module.scss";

const BATCH_SIZE = 8;

export type CatalogExperienceProps = {
  /** External items from API hook (e.g. useGetAds). Falls back to mock data. */
  items?: CatalogUiItem[];
  /** Total count from API (for toolbar). Falls back to items.length. */
  total?: number;
  /** True while first page is loading. Shows skeleton. */
  isLoading?: boolean;
  /** True when API returned an error. */
  isError?: boolean;
  /** Called when more items are needed (infinite scroll). */
  onLoadMore?: () => void;
  /** Whether there are more pages available from API. */
  hasMore?: boolean;
};

export function CatalogExperience({
  items: externalItems,
  total: externalTotal,
  isLoading: externalLoading,
  isError = false,
  onLoadMore,
  hasMore: externalHasMore,
}: CatalogExperienceProps = {}) {
  const router = useRouter();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const businessCatalog = useCatalogPage(
    {
      search: filters.search || undefined,
      city: filters.city || undefined,
      priceFrom: filters.minPrice ? Number(filters.minPrice) : undefined,
      priceTo: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      pageSize: BATCH_SIZE,
    },
    { skip: Boolean(externalItems) },
  );

  const businessItems = businessCatalog.products as CatalogUiItem[];
  const sourceItems = externalItems ?? businessItems;

  /*
  useEffect(() => {
    if (!useMockMode) return undefined;
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, [useMockMode]);
  */

  const filteredItems = useMemo(() => sourceItems, [sourceItems]);

  /*
  const filteredItems = useMemo(
    () => applyCatalogFilters(mockCatalogItems, filters),
    [filters],
  );
  const visibleItems = filteredItems.slice(0, visibleCount);
  */
  const visibleItems = filteredItems;

  const { product: selectedProduct, isLoading: isDetailLoading } = useGetAdById(
    selectedItemId ?? "",
    { skip: !selectedItemId },
  );
  const selectedItem = selectedProduct
    ? mapDetailsVMToUiItem(selectedProduct)
    : null;

  /*
  const similarItems = selectedItem
    ? mockCatalogItems
        .filter(
          (item) =>
            item.id !== selectedItem.id &&
            item.category === selectedItem.category,
        )
        .slice(0, 4)
    : [];
  */
  const similarItems: CatalogUiItem[] = [];

  const hasMore = externalHasMore ?? businessCatalog.hasNextPage;

  const onCloseFilters = () => setIsFiltersOpen(false);
  const onToggleFilters = () => setIsFiltersOpen(!isFiltersOpen);

  const updateFilters = (patch: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const navigateToSearch = useCallback(() => {
    if (isFiltersOpen) setIsFiltersOpen(false);
    const qs = filtersToSearchParams(filters);
    router.push(`${ROUTES.search}${qs ? `?${qs}` : ""}`);
  }, [filters, isFiltersOpen, router]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current || selectedItemId) {
      return undefined;
    }

    const node = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (onLoadMore) {
            onLoadMore();
          } else {
            businessCatalog.fetchNextPage();
          }
        }
      },
      { rootMargin: "360px 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [
    businessCatalog,
    filteredItems.length,
    hasMore,
    onLoadMore,
    selectedItemId,
  ]);

  const handleOpenItem = (item: CatalogUiItem) => {
    setIsFiltersOpen(false);
    setSelectedItemId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToCatalog = () => {
    setSelectedItemId(null);
  };

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (externalLoading || businessCatalog.isLoading) {
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

  if (isError || businessCatalog.isError) {
    return (
      <div className={styles.page}>
        <CatalogHeader cityLabel={filters.city} />
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <PackageSearch size={28} />
            </div>
            <h3>Не удалось загрузить каталог</h3>
            <p>Проверьте подключение к интернету и попробуйте снова</p>
            <button
              type="button"
              className={styles.emptyStateBtn}
              onClick={() => window.location.reload()}
            >
              Обновить страницу
            </button>
          </div>
        </main>
        <CatalogFooter />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <CatalogHeader
        cityLabel={filters.city}
        isHidden={isFiltersOpen}
        onBrandClick={() => setSelectedItemId(null)}
      />

      <main className={styles.main}>
        <CatalogSearchBar
          filters={filters}
          resultsCount={filteredItems.length}
          isFiltersOpen={isFiltersOpen}
          onToggleFilters={onToggleFilters}
          onCloseFilters={onCloseFilters}
          onChange={updateFilters}
          onResetFilters={() => setFilters(INITIAL_FILTERS)}
          onSearch={navigateToSearch}
          onFiltersConfirm={navigateToSearch}
        />

        {selectedItemId ? null : (
          <>
            <header className={styles.hero}>
              <motion.div
                className={styles.heroGlassCard}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className={styles.heroContent}>
                  <span className={styles.eyebrow}>ВАШ — АРЕНДАЙ</span>
                  <h1 className={styles.title}>
                    Берите в аренду то, что нужно сейчас
                  </h1>
                  <p className={styles.subtitle}>
                    Инструменты, техника и товары для досуга в вашем городе.
                  </p>

                  <div className={styles.stats}>
                    <div className={styles.statCard}>
                      <strong>1 000+</strong>
                      <span>вещей</span>
                    </div>
                    <div className={styles.statCard}>
                      <strong>50+</strong>
                      <span>городов</span>
                    </div>
                    <div className={styles.statCard}>
                      <strong>100%</strong>
                      <span>защита сделок</span>
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
          {selectedItemId ? (
            <motion.div
              key="product-detail"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {selectedItem && !isDetailLoading ? (
                <ProductDetail
                  item={selectedItem}
                  similarItems={similarItems}
                  onBack={handleBackToCatalog}
                  onOpenSimilar={handleOpenItem}
                />
              ) : (
                <div className={styles.loadingShell}>
                  <CatalogSkeletonCard />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="catalog-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <section
                id="catalog-results"
                className={styles.catalogLayoutClosed}
              >
                <div className={styles.content}>
                  <CatalogToolbar
                    filters={filters}
                    onChange={updateFilters}
                    visibleCount={filteredItems.length}
                    totalCount={
                      externalTotal ??
                      businessCatalog.total ??
                      filteredItems.length
                    }
                  />

                  {visibleItems.length > 0 ? (
                    <div className={styles.resultsGrid}>
                      {visibleItems.map((item) => (
                        <CatalogCard
                          key={item.id}
                          item={item}
                          onOpen={handleOpenItem}
                        />
                      ))}
                      {hasMore ? (
                        <div
                          ref={sentinelRef}
                          className={styles.infiniteSentinel}
                        />
                      ) : visibleItems.length > BATCH_SIZE ? (
                        <div className={styles.endCap}>
                          Вы просмотрели все объявления
                        </div>
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
                        onClick={() =>
                          updateFilters({
                            search: "",
                            category: "Все категории",
                          })
                        }
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
