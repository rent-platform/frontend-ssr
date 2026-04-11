import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
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
    <motion.section
      ref={shellRef}
      className={styles.searchShell}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.searchBar}>
        <motion.label
          className={styles.searchInputWrap}
          whileTap={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <motion.span
            className={styles.searchIcon}
            animate={{ rotate: filters.search ? 90 : 0 }}
          >
            ⌕
          </motion.span>
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            className={styles.searchInput}
            placeholder="Поиск по объявлениям"
          />
        </motion.label>

        <button
          type="button"
          className={styles.searchButton}
          onClick={handlePrimaryAction}
          aria-expanded={isFiltersOpen}
          aria-controls="catalog-filters-panel"
        >
          {isFiltersOpen
            ? `Показать ${resultsCount} ${getAnnouncementsLabel(resultsCount)}`
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
          Найдено {resultsCount} {getAnnouncementsLabel(resultsCount)} по текущим параметрам.
        </p>
      </div>

      <AnimatePresence>
        {isFiltersOpen && (
          <motion.div
            id="catalog-filters-panel"
            className={styles.searchFiltersPanel}
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
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
