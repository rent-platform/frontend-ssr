"use client";

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
  PriceModeFilter,
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
  const [priceMode, setPriceMode] = useState<PriceModeFilter>("all");
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

      const matchesPriceMode =
        priceMode === "all" ||
        (priceMode === "day" && Boolean(item.price_per_day)) ||
        (priceMode === "hour" && Boolean(item.price_per_hour));

      const matchesQuickFilters =
        (!quickFilters.instantBook || item.instantBook) &&
        (!quickFilters.noDeposit || Number(item.deposit_amount) === 0) &&
        (!quickFilters.newArrival || item.isNewArrival) &&
        (!quickFilters.delivery || item.delivery);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesAvailability &&
        matchesPriceMode &&
        matchesQuickFilters
      );
    });

    return items.sort((left, right) => {
      switch (sort) {
        case "newest":
          return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
        case "price-asc":
          return getNumericPrice(left.price_per_day) - getNumericPrice(right.price_per_day);
        case "price-desc":
          return getNumericPrice(right.price_per_day) - getNumericPrice(left.price_per_day);
        case "rating":
          return right.rating - left.rating;
        case "popular":
        default:
          return right.views_count - left.views_count;
      }
    });
  }, [availability, priceMode, query, quickFilters, selectedCategory, sort]);

  useEffect(() => {
    setVisibleCount(INITIAL_BATCH);
  }, [query, selectedCategory, availability, priceMode, sort, quickFilters]);

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
  }, [filteredItems.length, hasMore, isLoadingMore]);

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("Все");
    setAvailability("all");
    setPriceMode("all");
    setSort("popular");
    setQuickFilters(initialQuickFilters);
  };

  const toggleQuickFilter = (key: QuickFilterKey) => {
    setQuickFilters((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  if (isPageLoading) {
    return (
      <section className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingShell}>
            <div className={styles.loadingHero} />
            <div className={styles.loadingColumns}>
              <div className={styles.loadingSidebar} />
              <div className={styles.content}>
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
      </section>
    );
  }

  return (
    <section className={styles.page}>
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
                инструменты и товары для дома. Интерфейс собран как UI-модуль и готов к
                подключению реальных данных.
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
                  Контракт через props без входа в business-слой
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.searchSection}>
            <CatalogSearchBar
              value={query}
              onChange={setQuery}
              onToggleFilters={() => setMobileFiltersOpen((current) => !current)}
              mobileFiltersOpen={mobileFiltersOpen}
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
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            availability={availability}
            onAvailabilityChange={setAvailability}
            priceMode={priceMode}
            onPriceModeChange={setPriceMode}
            quickFilters={quickFilters}
            onToggleQuickFilter={toggleQuickFilter}
            onReset={resetFilters}
            totalCount={filteredItems.length}
            visibleCount={visibleItems.length}
            isMobileOpen={mobileFiltersOpen}
          />

          <div className={styles.content}>
            <div className={styles.toolbar}>
              <div className={styles.toolbarInfo}>
                <h2>Объявления в каталоге</h2>
                <p>
                  {filteredItems.length > 0
                    ? `Показано ${visibleItems.length} из ${filteredItems.length}`
                    : "Попробуй снять часть фильтров или изменить запрос"}
                </p>
              </div>

              <div className={styles.toolbarControls}>
                <label className={styles.selectWrap}>
                  <span>Сортировка</span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as CatalogSort)}
                    className={styles.select}
                  >
                    <option value="popular">Сначала популярные</option>
                    <option value="newest">Сначала новые</option>
                    <option value="price-asc">Цена по возрастанию</option>
                    <option value="price-desc">Цена по убыванию</option>
                    <option value="rating">Лучший рейтинг</option>
                  </select>
                </label>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <PackageSearch size={36} />
                <h3>Ничего не найдено</h3>
                <p>
                  В UI всё готово для пустого состояния: экран подсказывает, что изменить,
                  и остаётся совместимым с будущей business-интеграцией.
                </p>
                <button type="button" className={styles.emptyButton} onClick={resetFilters}>
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <>
                <div className={styles.resultsGrid}>
                  {visibleItems.map((item) => (
                    <CatalogCard key={item.id} item={item} />
                  ))}
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
                  <div ref={sentinelRef} aria-hidden="true" />
                ) : (
                  <div className={styles.endCap}>
                    Ты дошёл до конца UI-ленты. Реальную постраничную загрузку и API потом
                    подключит Илья.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
