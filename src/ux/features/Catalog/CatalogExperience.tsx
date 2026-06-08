"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUp, PackageSearch } from "lucide-react";
import { CatalogHeader } from "./components/layout/CatalogHeader";
import { CatalogSearchBar } from "./components/filters/CatalogSearchBar";
import { CategoryRail } from "./components/filters/CategoryRail";
import { CatalogToolbar } from "./components/filters/CatalogToolbar";
import { CatalogCard } from "./components/cards/CatalogCard";
import { ProductDetail } from "./components/detail/ProductDetail";
import { CatalogSkeletonCard } from "./components/cards/CatalogSkeletonCard";
import { CatalogFooter } from "./components/layout/CatalogFooter";
import type { CatalogUiItem } from "./types";
import { CATEGORY_OPTIONS, INITIAL_FILTERS } from "./utils";
import { useCatalogPage } from "@/business/ads";
import { useFetchCategoriesQuery } from "@/business/ads/api";
import type { FetchAdsArgs } from "@/business/ads";
import { useAppSelector } from "@/business/shared";
import { useCatalog } from "./hooks/useCatalog";
import styles from "./Catalog.module.scss";

let lastBackendQueryTraceKey: string | null = null;

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
  const catalogFilters = useAppSelector((state) => state.catalog.filters);
  const [draftFilters, setDraftFilters] = useState(catalogFilters);
  const { data: backendCategories = [] } = useFetchCategoriesQuery();
  const allCategoryLabel = CATEGORY_OPTIONS[0];
  const categoryOptions =
    backendCategories.length > 0
      ? [
          allCategoryLabel,
          ...backendCategories
            .map((category) => category.categoryName)
            .filter((categoryName): categoryName is string =>
              Boolean(categoryName),
            ),
        ]
      : CATEGORY_OPTIONS;
  const selectedCategory = backendCategories.find(
    (category) => category.categoryName === catalogFilters.category,
  );
  const catalogQueryArgs: FetchAdsArgs = useMemo(
    () => ({
      pageSize: 5,
      categoryId: selectedCategory?.id,
      search: catalogFilters.search || undefined,
      city: catalogFilters.city || undefined,
      priceFrom: catalogFilters.minPrice
        ? Number(catalogFilters.minPrice)
        : undefined,
      priceTo: catalogFilters.maxPrice
        ? Number(catalogFilters.maxPrice)
        : undefined,
      sortBy:
        catalogFilters.sortBy === "newest"
          ? "createdAt"
          : catalogFilters.sortBy === "rating"
            ? "rating"
            : catalogFilters.sortBy === "priceAsc" ||
                catalogFilters.sortBy === "priceDesc"
              ? "pricePerDay"
              : "createdAt",
      sortDirection: catalogFilters.sortBy === "priceAsc" ? "asc" : "desc",
    }),
    [
      catalogFilters.city,
      catalogFilters.maxPrice,
      catalogFilters.minPrice,
      catalogFilters.search,
      catalogFilters.sortBy,
      selectedCategory?.id,
    ],
  );
  const shouldUseBackend = !externalItems;
  const backendCatalog = useCatalogPage(catalogQueryArgs, {
    skip: !shouldUseBackend,
  });
  const catalogItems = externalItems ?? backendCatalog.products;
  const catalogTotal = externalTotal ?? backendCatalog.total;
  const catalogLoading = externalLoading ?? backendCatalog.isLoading;
  const catalogError = isError || backendCatalog.isError;
  const catalogHasMore = externalHasMore ?? backendCatalog.hasNextPage;
  const loadMore = onLoadMore ?? backendCatalog.fetchNextPage;
  const backendQueryTraceKey = useMemo(
    () => JSON.stringify({ catalogQueryArgs, shouldUseBackend }),
    [catalogQueryArgs, shouldUseBackend],
  );

  useEffect(() => {
    if (!shouldUseBackend) {
      return;
    }
    if (lastBackendQueryTraceKey === backendQueryTraceKey) {
      return;
    }

    lastBackendQueryTraceKey = backendQueryTraceKey;
    console.log("[TRACE][CATALOG][UI] backend query args prepared", {
      catalogQueryArgs,
      appliedFilters: catalogFilters,
      shouldUseBackend,
    });
  }, [backendQueryTraceKey, catalogFilters, catalogQueryArgs, shouldUseBackend]);

  const {
    filters,
    setFilters,
    selectedItem,
    setSelectedItem,
    isFiltersOpen,
    isInitialLoading,
    showScrollTop,
    sentinelRef,
    useMockMode,
    filteredItems,
    visibleItems,
    similarItems,
    hasMore,
    onCloseFilters,
    onToggleFilters,
    navigateToSearch,
    handleOpenItem,
    handleBackToCatalog,
    scrollToTop,
    BATCH_SIZE,
  } = useCatalog({
    items: catalogItems,
    total: catalogTotal,
    isLoading: catalogLoading,
    onLoadMore: loadMore,
    hasMore: catalogHasMore,
  });

  useEffect(() => {
    setDraftFilters(catalogFilters);
  }, [catalogFilters]);

  const updateDraftFilters = useCallback(
    (patch: Partial<typeof draftFilters>) => {
      const nextFilters = { ...draftFilters, ...patch };
      console.log("[TRACE][CATALOG][UI] draft filters changed", {
        patch,
        previousFilters: draftFilters,
        nextFilters,
      });
      setDraftFilters(nextFilters);
    },
    [draftFilters],
  );

  const applyDraftFilters = useCallback(
    (nextDraftFilters = draftFilters) => {
      console.log("[TRACE][CATALOG][UI] apply filters submitted", {
        draftFilters: nextDraftFilters,
        previousAppliedFilters: catalogFilters,
      });
      setFilters(nextDraftFilters);
      navigateToSearch(nextDraftFilters);
    },
    [catalogFilters, draftFilters, navigateToSearch, setFilters],
  );

  const resetDraftFilters = useCallback(() => {
    console.log("[TRACE][CATALOG][UI] draft filters reset", {
      previousDraftFilters: draftFilters,
    });
    setDraftFilters(INITIAL_FILTERS);
  }, [draftFilters]);

  useEffect(() => {
    if (!catalogLoading && !catalogError && visibleItems.length === 0) {
      console.log("[TRACE][CATALOG][UI] empty result rendered", {
        filters,
        total: catalogTotal,
      });
    }
  }, [
    catalogError,
    catalogLoading,
    catalogTotal,
    filters,
    visibleItems.length,
  ]);

  if (catalogLoading || isInitialLoading) {
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

  if (catalogError) {
    console.log("[TRACE][CATALOG][UI] catalog error state rendered", {
      error: backendCatalog.error,
    });
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
        onBrandClick={() => setSelectedItem(null)}
      />

      <main className={styles.main}>
        <CatalogSearchBar
          filters={draftFilters}
          resultsCount={filteredItems.length}
          isFiltersOpen={isFiltersOpen}
          onToggleFilters={onToggleFilters}
          onCloseFilters={onCloseFilters}
          onChange={updateDraftFilters}
          onResetFilters={resetDraftFilters}
          onSearch={applyDraftFilters}
          onFiltersConfirm={applyDraftFilters}
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
              categories={categoryOptions}
              activeCategory={draftFilters.category}
              allCategoryLabel={allCategoryLabel}
              onCategoryChange={(category) => updateDraftFilters({ category })}
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
              <section
                id="catalog-results"
                className={styles.catalogLayoutClosed}
              >
                <div className={styles.content}>
                  <CatalogToolbar
                    filters={draftFilters}
                    onChange={updateDraftFilters}
                    visibleCount={
                      useMockMode ? visibleItems.length : filteredItems.length
                    }
                    totalCount={catalogTotal ?? filteredItems.length}
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
                        onClick={() => {
                          setFilters(INITIAL_FILTERS);
                          navigateToSearch(INITIAL_FILTERS);
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
