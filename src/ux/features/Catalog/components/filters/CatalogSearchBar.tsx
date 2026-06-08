'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { CatalogFilterState } from '../../types';
import { INITIAL_FILTERS } from '../../utils';
import { CatalogFilters } from './CatalogFilters';
import { useDebouncedValue } from '@/business/shared';
import styles from './CatalogSearchBar.module.scss';

type CatalogSearchBarProps = {
  filters: CatalogFilterState;
  resultsCount: number;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
  onCloseFilters: () => void;
  onChange: (patch: Partial<CatalogFilterState>) => void;
  onResetFilters: () => void;
  onSearch?: (nextFilters?: CatalogFilterState) => void;
  onFiltersConfirm?: (nextFilters?: CatalogFilterState) => void;
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
  const lastCommittedSearchRef = useRef(filters.search);
  const [searchValue, setSearchValue] = useState(filters.search);
  const debouncedSearchValue = useDebouncedValue(searchValue, 400);

  useEffect(() => {
    if (filters.search === lastCommittedSearchRef.current) {
      return;
    }

    lastCommittedSearchRef.current = filters.search;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync local input when parent resets/applies filters.
    setSearchValue(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearchValue === lastCommittedSearchRef.current) {
      return;
    }

    lastCommittedSearchRef.current = debouncedSearchValue;
    console.log('[TRACE][CATALOG][UI] search debounced', {
      value: debouncedSearchValue,
      debounceMs: 400,
    });
    onChange({ search: debouncedSearchValue });
  }, [debouncedSearchValue, onChange]);

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
    const submittedFilters = { ...filters, search: searchValue };
    if (searchValue !== lastCommittedSearchRef.current) {
      lastCommittedSearchRef.current = searchValue;
    }

    console.log('[TRACE][CATALOG][UI] search submitted', {
      search: searchValue,
      activeFiltersCount,
      draftFilters: submittedFilters,
    });
    if (onSearch) {
      onSearch(submittedFilters);
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
    <>
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
              value={searchValue}
              onChange={(event) => {
                console.log('[TRACE][CATALOG][UI] search input changed', {
                  value: event.target.value,
                });
                setSearchValue(event.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  console.log('[TRACE][CATALOG][UI] search submitted by Enter');
                  handleSearchAction();
                }
              }}
              className={styles.searchInput}
              placeholder="Что вы хотите арендовать?"
            />
          </div>

          <div className={styles.searchDivider} />

          <motion.button
            type="button"
            className={isFiltersOpen ? styles.searchButtonActive : styles.searchButton}
            onClick={() => {
              console.log('[TRACE][CATALOG][UI] filters toggle clicked', {
                nextOpen: !isFiltersOpen,
              });
              onToggleFilters();
            }}
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
      </motion.section>

      <AnimatePresence>
        {isFiltersOpen && (
          <CatalogFilters
            filters={filters}
            resultsCount={resultsCount}
            onChange={onChange}
            onReset={onResetFilters}
            onClose={onCloseFilters}
            onConfirm={(nextFilters) =>
              onFiltersConfirm?.({ ...(nextFilters ?? filters), search: searchValue })
            }
          />
        )}
      </AnimatePresence>
    </>
  );
}
