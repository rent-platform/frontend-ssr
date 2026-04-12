"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Grid2X2, PackageSearch, ShieldCheck, Sparkles, TimerReset, TrendingUp } from "lucide-react";
import { CatalogSearchBar } from "./components/CatalogSearchBar";
import { CatalogFilters } from "./components/CatalogFilters";
import { CatalogCard } from "./components/CatalogCard";
import { CatalogSkeletonCard } from "./components/CatalogSkeletonCard";
import { mockCatalogItems } from "./mockCatalogItems";
import type {
  AvailabilityFilter,
  CatalogCategory,
  CatalogQuickFiltersState,
  CatalogSort,
  QuickFilterKey,
} from "./types";
import { getNumericPrice } from "./utils";
import styles from "./Catalog.module.scss";

const INITIAL_BATCH = 6;
const NEXT_BATCH = 3;

const initialQuickFilters: CatalogQuickFiltersState = {
  instantBook: false,
  noDeposit: false,
  newArrival: false,
  delivery: false,
};

const categories = Array.from(
  new Set(mockCatalogItems.map((item) => item.category)),
) as CatalogCategory[];

export default function Catalog() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | "Все">("Все");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [sort, setSort] = useState<CatalogSort>("popular");
  const [quickFilters, setQuickFilters] = useState<CatalogQuickFiltersState>(initialQuickFilters);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsPageLoading(false), 900);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const items = mockCatalogItems.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        [item.title, item.item_description ?? "", item.category, item.location ?? "", ...item.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory = selectedCategory === "Все" || item.category === selectedCategory;

      const matchesAvailability =
        availability === "all" ||
        (availability === "available" && item.isAvailable) ||
        (availability === "soon" && !item.isAvailable);

      const matchesQuickFilters =
        (!quickFilters.instantBook || item.quickFilters.includes('Рядом сегодня')) &&
        (!quickFilters.noDeposit || item.quickFilters.includes('Без залога')) &&
        (!quickFilters.newArrival || item.quickFilters.includes('Новинки')) &&
        (!quickFilters.delivery || item.quickFilters.includes('С доставкой'));

      return (
        matchesQuery &&
        matchesCategory &&
        matchesAvailability &&
        matchesQuickFilters
      );
    });

    return items.sort((left, right) => {
      switch (sort) {
        case "newest":
          return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
        case "priceAsc":
          return getNumericPrice(left.price_per_day) - getNumericPrice(right.price_per_day);
        case "priceDesc":
          return getNumericPrice(right.price_per_day) - getNumericPrice(left.price_per_day);
        case "rating":
          return right.ownerRating - left.ownerRating;
        case "popular":
        default:
          return right.views_count - left.views_count;
      }
    });
  }, [availability, query, quickFilters, selectedCategory, sort]);

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("Все");
    setAvailability("all");
    setSort("popular");
    setQuickFilters(initialQuickFilters);
    setVisibleCount(INITIAL_BATCH);
  };

  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
    setVisibleCount(INITIAL_BATCH);
  };

  const updateCategory = (newCategory: CatalogCategory | "Все") => {
    setSelectedCategory(newCategory);
    setVisibleCount(INITIAL_BATCH);
  };

  const updateSort = (newSort: CatalogSort) => {
    setSort(newSort);
    setVisibleCount(INITIAL_BATCH);
  };

  const toggleQuickFilter = (key: QuickFilterKey) => {
    setQuickFilters((current) => ({
      ...current,
      [key]: !current[key],
    }));
    setVisibleCount(INITIAL_BATCH);
  };

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleItems.length < filteredItems.length;

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting || isLoadingMore) return;

        setIsLoadingMore(true);
        window.setTimeout(() => {
          setVisibleCount((current) => Math.min(current + NEXT_BATCH, filteredItems.length));
          setIsLoadingMore(false);
        }, 700);
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [filteredItems.length, hasMore, isLoadingMore, sentinelRef]);

  if (isPageLoading) {
    return (
      <motion.section
        className={styles.page}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className={styles.container}>
          <div className={styles.loadingShell}>
            <div className={styles.loadingHero} />
            <div className={styles.loadingColumns}>
              <div className={styles.loadingSidebar} />
              <div id="catalog-results" className={styles.content}>
                <div className={styles.loadingToolbar} />
                <div className={styles.loadingGrid}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className={styles.loadingBlock} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.heroTop}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>
                <Sparkles size={14} />
                Каталог аренды вещей
              </span>
              <h1 className={styles.title}>Современный каталог для шеринг-сервиса</h1>
              <p className={styles.subtitle}>
                Находите вещи на пару часов, день или уикенд: техника, спорт, путешествия,
                инструменты и товары для дома. 
              </p>

              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <strong>{mockCatalogItems.length}</strong>
                  <span>карточек в dev-ui каталоге</span>
                </div>
                <div className={styles.statCard}>
                  <strong>{categories.length}</strong>
                  <span>категорий с быстрым фильтром</span>
                </div>
                <div className={styles.statCard}>
                  <strong>∞</strong>
                  <span>готовность к бесконечной ленте</span>
                </div>
              </div>
            </div>

            <div className={styles.heroPanel}>
              <h2 className={styles.panelTitle}>Что уже реализовано в UI</h2>
              <ul className={styles.panelList}>
                <li>
                  <span className={styles.panelIcon}>
                    <Grid2X2 size={18} />
                  </span>
                  Адаптивная сетка каталога и современные карточки объявления
                </li>
                <li>
                  <span className={styles.panelIcon}>
                    <TrendingUp size={18} />
                  </span>
                  Поиск, сортировка, категории и быстрые фильтры
                </li>
                <li>
                  <span className={styles.panelIcon}>
                    <TimerReset size={18} />
                  </span>
                  Skeleton-состояния, empty state и UI infinite scroll
                </li>
                <li>
                  <span className={styles.panelIcon}>
                    <ShieldCheck size={18} />
                  </span>
                  Контракт через props
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.searchSection}>
            <CatalogSearchBar
              filters={{
                search: query,
                city: "Новосибирск",
                category: selectedCategory === "Все" ? "Все категории" : selectedCategory,
                minPrice: "",
                maxPrice: "",
                onlyAvailable: availability === "available",
                sortBy: sort,
                quickFilter: null,
              }}
              resultsCount={filteredItems.length}
              isFiltersOpen={mobileFiltersOpen}
              onToggleFilters={() => setMobileFiltersOpen((current) => !current)}
              onCloseFilters={() => setMobileFiltersOpen(false)}
              onChange={(patch) => {
                if (patch.category !== undefined) {
                  const cat = patch.category === "Все категории" ? "Все" : patch.category;
                  updateCategory(cat as CatalogCategory | "Все");
                }
                if (patch.onlyAvailable !== undefined) {
                  setAvailability(patch.onlyAvailable ? "available" : "all");
                  setVisibleCount(INITIAL_BATCH);
                }
                if (patch.sortBy !== undefined) updateSort(patch.sortBy as CatalogSort);
                if (patch.search !== undefined) updateQuery(patch.search);
              }}
              onResetFilters={resetFilters}
            />

            <div className={styles.quickPills}>
              <span className={styles.pill}>
                <ShieldCheck size={14} />
                Безопасные карточки и empty states
              </span>
              <span className={styles.pill}>
                <Sparkles size={14} />
                Шеринг-подача с акцентом на доверие
              </span>
              <span className={styles.pill}>
                <TrendingUp size={14} />
                Готово к подключению к real API позже
              </span>
            </div>
          </div>
        </header>

        <div className={styles.catalogLayout}>
          <CatalogFilters
            filters={{
              search: query,
              city: "Новосибирск",
              category: selectedCategory === "Все" ? "Все категории" : selectedCategory,
              minPrice: "",
              maxPrice: "",
              onlyAvailable: availability === "available",
              sortBy: sort,
              quickFilter: null,
            }}
            resultsCount={filteredItems.length}
            onChange={(patch) => {
              if (patch.category !== undefined) {
                const cat = patch.category === "Все категории" ? "Все" : patch.category;
                updateCategory(cat as CatalogCategory | "Все");
              }
              if (patch.onlyAvailable !== undefined) {
                setAvailability(patch.onlyAvailable ? "available" : "all");
                setVisibleCount(INITIAL_BATCH);
              }
              if (patch.sortBy !== undefined) updateSort(patch.sortBy as CatalogSort);
              if (patch.quickFilter !== undefined) {
                if (patch.quickFilter === null) {
                  // This is complex because Catalog.tsx uses separate state for quick filters
                  // For simplicity, let's reset them if null is passed
                  setQuickFilters(initialQuickFilters);
                } else {
                  // Find the key for this option
                  const keyMap: Record<string, keyof CatalogQuickFiltersState> = {
                    'С доставкой': 'delivery',
                    'Рядом сегодня': 'instantBook', // assuming mapping
                    'Без залога': 'noDeposit',
                    'Топ-рейтинг': 'instantBook', // assuming mapping
                    'Новинки': 'newArrival',
                  };
                  const key = keyMap[patch.quickFilter];
                  if (key) toggleQuickFilter(key);
                }
              }
              if (patch.search !== undefined) updateQuery(patch.search);
            }}
            onReset={resetFilters}
            onClose={() => setMobileFiltersOpen(false)}
            isMobileOpen={mobileFiltersOpen}
          />

          <div id="catalog-results" className={styles.content}>
            <div className={styles.toolbar}>
              <div className={styles.toolbarControls}>
                <p className={styles.resultsCountMinimal}>
                  Найдено <strong>{filteredItems.length}</strong> {getAnnouncementsLabel(filteredItems.length)}
                </p>

                <div className={styles.searchDivider} style={{ height: '16px' }} />

                <label className={styles.selectWrap}>
                  <span>Сортировка</span>
                  <select
                    value={sort}
                    onChange={(event) => updateSort(event.target.value as CatalogSort)}
                    className={styles.select}
                  >
                    <option value="popular">популярные</option>
                    <option value="newest">новые</option>
                    <option value="priceAsc">дешевле</option>
                    <option value="priceDesc">дороже</option>
                    <option value="rating">с рейтингом</option>
                  </select>
                </label>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <PackageSearch size={36} />
                <h3>Ничего не найдено</h3>
                <p>
                  В UI готово для пустого состояния - экран подсказывает, что изменить,
                  и остаётся совместимым с будущей биз интгр.
                </p>
                <button type="button" className={styles.emptyButton} onClick={resetFilters}>
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <>
                <div className={styles.resultsGrid}>
                  <AnimatePresence mode="popLayout">
                    {visibleItems.map((item, index) => (
                      <CatalogCard key={item.id} item={item} index={index} />
                    ))}
                  </AnimatePresence>
                </div>

                {isLoadingMore && (
                  <div className={styles.loadMoreState}>
                    <span className={styles.loadMoreHint}>Загружаем следующую порцию карточек…</span>
                    <div className={styles.resultsGrid}>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <CatalogSkeletonCard key={index} />
                      ))}
                    </div>
                  </div>
                )}

                {hasMore ? (
                  <div ref={sentinelRef} style={{ height: '20px' }} aria-hidden="true" />
                ) : (
                  <div className={styles.endCap}>
                    Ты дошёл до конца UI-ленты - реал постраничную загрузку и апи потом
                    подключишь 
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
