import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { CatalogFilterState } from '../types';
import { INITIAL_FILTERS } from '../utils';
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
  onSearch?: () => void;
  onFiltersConfirm?: () => void;
};

export function CatalogSearchBar({
  filters,
  resultsCount,
  isFiltersOpen,
  onToggleFilters,
  onCloseFilters,
  onChange,
  onResetFilters,
  onSearch,
  onFiltersConfirm,
}: CatalogSearchBarProps) {
  const shellRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isFiltersOpen) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseFilters();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFiltersOpen, onCloseFilters]);

  useEffect(() => {
    if (!isFiltersOpen) {
      document.body.style.removeProperty('overflow');
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFiltersOpen]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (filters.city !== INITIAL_FILTERS.city) count += 1;
    if (filters.category !== INITIAL_FILTERS.category) count += 1;
    if (filters.minPrice) count += 1;
    if (filters.maxPrice) count += 1;
    if (filters.quickFilter !== INITIAL_FILTERS.quickFilter) count += 1;
    if (filters.onlyAvailable !== INITIAL_FILTERS.onlyAvailable) count += 1;
    if (filters.hasDeposit !== INITIAL_FILTERS.hasDeposit) count += 1;

    return count;
  }, [filters]);

  const summaryItems = useMemo(() => {
    const items: string[] = [];

    if (filters.city !== INITIAL_FILTERS.city) {
      items.push(filters.city);
    }

    if (filters.category !== INITIAL_FILTERS.category) {
      items.push(filters.category);
    }

    if (filters.onlyAvailable !== INITIAL_FILTERS.onlyAvailable) {
      items.push(filters.onlyAvailable ? 'Доступно сегодня' : 'Все предложения');
    }

    if (filters.minPrice || filters.maxPrice) {
      const minLabel = filters.minPrice ? `от ${filters.minPrice} ₽` : 'от любой цены';
      const maxLabel = filters.maxPrice ? `до ${filters.maxPrice} ₽` : 'без лимита';
      items.push(`${minLabel} · ${maxLabel}`);
    }

    if (filters.hasDeposit !== INITIAL_FILTERS.hasDeposit) {
      items.push(filters.hasDeposit === 'no' ? 'Без залога' : 'С залогом');
    }

    if (filters.quickFilter) {
      items.push(filters.quickFilter);
    }

    return items;
  }, [filters]);

  const handleSearchAction = () => {
    if (onSearch) {
      onSearch();
      return;
    }

    if (isFiltersOpen) {
      onCloseFilters();
    }
    
    document.getElementById('catalog-results')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <motion.section
      ref={shellRef}
      className={styles.searchShell}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrap}>
          <Search size={20} className={styles.searchIcon} />
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchAction()}
            className={styles.searchInput}
            placeholder="Что вы хотите арендовать?"
          />
        </div>

        <div className={styles.searchDivider} />

        <motion.button
          type="button"
          className={isFiltersOpen ? styles.searchButtonActive : styles.searchButton}
          onClick={onToggleFilters}
          aria-expanded={isFiltersOpen}
          aria-controls="catalog-filters-panel"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98, y: 0 }}
        >
          <SlidersHorizontal size={18} />
          <span>
            {isFiltersOpen
              ? `Скрыть`
              : 'Фильтры'}
          </span>
          {activeFiltersCount > 0 && (
            <span className={styles.filtersCount}>
              {activeFiltersCount}
            </span>
          )}
        </motion.button>

        <motion.button
          type="button"
          className={styles.primarySearchBtn}
          onClick={handleSearchAction}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98, y: 0 }}
        >
          <Search size={18} />
          <span>Найти</span>
        </motion.button>
      </div>

      {(filters.search.trim() || summaryItems.length > 0) && (
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
        </div>
      )}

      <AnimatePresence>
        {isFiltersOpen && (
          <CatalogFilters
            filters={filters}
            resultsCount={resultsCount}
            onChange={onChange}
            onReset={onResetFilters}
            onClose={onCloseFilters}
            onConfirm={onFiltersConfirm}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
}
