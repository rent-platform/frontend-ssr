import { useEffect, useMemo, useRef } from 'react';
import type { CatalogFilterState } from '../types';
import { CatalogFilters } from './CatalogFilters';
import styles from './CatalogSearchBar.module.scss';

type CatalogSearchBarProps = {
  filters: CatalogFilterState;
  resultsCount: number;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
  onCloseFilters: () => void;
  onChange: (patch: Partial<CatalogFilterState>) => void;
  onResetFilters: () => void;
};

function getResultsLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return 'объявление';
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'объявления';
  }

  return 'объявлений';
}

export function CatalogSearchBar({
  filters,
  resultsCount,
  isFiltersOpen,
  onToggleFilters,
  onCloseFilters,
  onChange,
  onResetFilters,
}: CatalogSearchBarProps) {
  const shellRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isFiltersOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) {
        onCloseFilters();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseFilters();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFiltersOpen, onCloseFilters]);

  const summaryItems = useMemo(() => {
    const items = [
      filters.city === 'Все города' ? 'Все города' : filters.city,
      filters.category === 'Все категории' ? 'Все категории' : filters.category,
      filters.pricingMode === 'day' ? 'Цена за сутки' : 'Цена за час',
      filters.onlyAvailable ? 'Только доступные' : 'Все предложения',
    ];

    if (filters.quickFilter) {
      items.push(filters.quickFilter);
    }

    if (filters.minPrice || filters.maxPrice) {
      const minLabel = filters.minPrice ? `от ${filters.minPrice} ₽` : 'от любой цены';
      const maxLabel = filters.maxPrice ? `до ${filters.maxPrice} ₽` : 'без верхней границы';
      items.push(`${minLabel} · ${maxLabel}`);
    }

    return items;
  }, [filters]);

  const handlePrimaryAction = () => {
    if (isFiltersOpen) {
      onCloseFilters();
      document.getElementById('catalog')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      return;
    }

    onToggleFilters();
  };

  return (
    <section ref={shellRef} className={styles.searchShell}>
      <div className={styles.searchBar}>
        <label className={styles.searchInputWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            className={styles.searchInput}
            placeholder="Поиск по объявлениям"
          />
        </label>

        <button
          type="button"
          className={styles.searchButton}
          onClick={handlePrimaryAction}
          aria-expanded={isFiltersOpen}
          aria-controls="catalog-filters-panel"
        >
          {isFiltersOpen
            ? `Показать ${resultsCount} ${getResultsLabel(resultsCount)}`
            : 'Фильтры'}
        </button>
      </div>

      <div className={styles.searchMetaRow}>
        <div className={styles.searchSummary}>
          {filters.search.trim() ? (
            <span className={styles.searchSummaryChip}>
              Поиск: «{filters.search.trim()}»
            </span>
          ) : null}

          {summaryItems.map((item) => (
            <span key={item} className={styles.searchSummaryChip}>
              {item}
            </span>
          ))}
        </div>

        <p className={styles.searchResultsNote}>
          Найдено {resultsCount} {getResultsLabel(resultsCount)} по текущим параметрам.
        </p>
      </div>

      {isFiltersOpen ? (
        <div id="catalog-filters-panel" className={styles.searchFiltersPanel}>
          <CatalogFilters
            filters={filters}
            resultsCount={resultsCount}
            onChange={onChange}
            onReset={onResetFilters}
            onClose={onCloseFilters}
          />
        </div>
      ) : null}
    </section>
  );
}
