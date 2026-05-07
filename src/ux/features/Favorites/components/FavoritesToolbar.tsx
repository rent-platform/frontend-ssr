'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownUp, Search, X } from 'lucide-react';
import type { SortOption } from '../types';
import { SORT_LABELS } from '../types';
import { EASE } from '@/ux/utils';
import styles from '../Favorites.module.scss';

export type FavoritesToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  sortOpen: boolean;
  onSortOpenChange: (open: boolean) => void;
};

export function FavoritesToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  sortOpen,
  onSortOpenChange,
}: FavoritesToolbarProps) {
  return (
    <motion.div
      className={styles.toolbar}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE }}
    >
      <div className={styles.searchWrap}>
        <Search size={15} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск в избранном..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={() => onSearchChange('')}
            aria-label="Очистить поиск"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className={styles.sortWrap}>
        <button
          type="button"
          className={styles.sortBtn}
          onClick={() => onSortOpenChange(!sortOpen)}
        >
          <ArrowDownUp size={14} />
          <span>{SORT_LABELS[sort]}</span>
        </button>

        <AnimatePresence>
          {sortOpen && (
            <>
              <motion.div
                className={styles.sortBackdrop}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => onSortOpenChange(false)}
              />
              <motion.div
                className={styles.sortDropdown}
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.18 }}
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={sort === key ? styles.sortOptionActive : styles.sortOption}
                    onClick={() => { onSortChange(key); onSortOpenChange(false); }}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
