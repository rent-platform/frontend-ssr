import type { ReactNode } from "react";
import clsx from "clsx";
import { RefreshCw, Sparkles, Truck, ShieldCheck } from "lucide-react";
import type {
  AvailabilityFilter,
  CatalogCategory,
  CatalogQuickFiltersState,
  PriceModeFilter,
  QuickFilterKey,
} from "../types";
import styles from "./CatalogFilters.module.scss";

type CatalogFiltersProps = {
  categories: CatalogCategory[];
  selectedCategory: CatalogCategory | "Все";
  onCategoryChange: (value: CatalogCategory | "Все") => void;
  availability: AvailabilityFilter;
  onAvailabilityChange: (value: AvailabilityFilter) => void;
  priceMode: PriceModeFilter;
  onPriceModeChange: (value: PriceModeFilter) => void;
  quickFilters: CatalogQuickFiltersState;
  onToggleQuickFilter: (key: QuickFilterKey) => void;
  onReset: () => void;
  totalCount: number;
  visibleCount: number;
  isMobileOpen: boolean;
};

const availabilityOptions: Array<{ label: string; value: AvailabilityFilter }> = [
  { label: "Все", value: "all" },
  { label: "Доступно сейчас", value: "available" },
  { label: "Освободится скоро", value: "soon" },
];

const priceModeOptions: Array<{ label: string; value: PriceModeFilter }> = [
  { label: "Все цены", value: "all" },
  { label: "Посуточно", value: "day" },
  { label: "Почасово", value: "hour" },
];

const quickFilterMeta: Record<QuickFilterKey, { label: string; icon: ReactNode }> = {
  instantBook: {
    label: "Моментальное бронирование",
    icon: <Sparkles size={16} />,
  },
  noDeposit: {
    label: "Без залога",
    icon: <ShieldCheck size={16} />,
  },
  newArrival: {
    label: "Новые объявления",
    icon: <RefreshCw size={16} />,
  },
  delivery: {
    label: "Есть доставка",
    icon: <Truck size={16} />,
  },
};

export function CatalogFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  availability,
  onAvailabilityChange,
  priceMode,
  onPriceModeChange,
  quickFilters,
  onToggleQuickFilter,
  onReset,
  totalCount,
  visibleCount,
  isMobileOpen,
}: CatalogFiltersProps) {
  return (
    <aside className={clsx(styles.sidebar, isMobileOpen && styles.mobileOpen)}>
      <div className={styles.card}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>Подбор</p>
            <h2 className={styles.title}>Фильтры каталога</h2>
          </div>
          <button type="button" className={styles.resetButton} onClick={onReset}>
            Сбросить
          </button>
        </div>

        <div className={styles.metrics}>
          <div>
            <span>Найдено</span>
            <strong>{totalCount}</strong>
          </div>
          <div>
            <span>Показано</span>
            <strong>{visibleCount}</strong>
          </div>
        </div>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Быстрые фильтры</h3>
          <div className={styles.quickList}>
            {(Object.keys(quickFilters) as QuickFilterKey[]).map((key) => (
              <button
                key={key}
                type="button"
                className={clsx(styles.quickChip, quickFilters[key] && styles.quickChipActive)}
                onClick={() => onToggleQuickFilter(key)}
              >
                {quickFilterMeta[key].icon}
                {quickFilterMeta[key].label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Категории</h3>
          <div className={styles.optionGrid}>
            <button
              type="button"
              className={clsx(styles.optionChip, selectedCategory === "Все" && styles.optionChipActive)}
              onClick={() => onCategoryChange("Все")}
            >
              Все категории
            </button>

            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={clsx(styles.optionChip, selectedCategory === category && styles.optionChipActive)}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Доступность</h3>
          <div className={styles.segmented}>
            {availabilityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={clsx(styles.segment, availability === option.value && styles.segmentActive)}
                onClick={() => onAvailabilityChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Формат цены</h3>
          <div className={styles.segmented}>
            {priceModeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={clsx(styles.segment, priceMode === option.value && styles.segmentActive)}
                onClick={() => onPriceModeChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <div className={styles.note}>
          <strong>Для интеграции:</strong>
          <span>
            UI ожидает список карточек и метаданные фильтров. Реальные query, store и API
            подключает Илья.
          </span>
        </div>
      </div>
    </aside>
  );
}
