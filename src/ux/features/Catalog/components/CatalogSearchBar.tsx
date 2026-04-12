import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { CatalogFilterState } from '../types';
import { getAnnouncementsLabel } from '../utils';
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

  const summaryItems = useMemo(() => {
    const items = [
      filters.city === 'Все города' ? 'Все города' : filters.city,
      filters.category === 'Все категории' ? 'Все категории' : filters.category,
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

  const handleSearchAction = () => {
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
          Найдено {resultsCount} {getAnnouncementsLabel(resultsCount)}
        </p>
      </div>

      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            id="catalog-filters-panel"
            className={styles.searchFiltersPanel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <CatalogFilters
              filters={filters}
              resultsCount={resultsCount}
              onChange={onChange}
              onReset={onResetFilters}
              onClose={onCloseFilters}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
