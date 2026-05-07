'use client';

import type { CatalogFilterState } from '../../types';
import { pluralize } from '@/ux/utils';
import { GlassSelect, type GlassSelectOption } from './GlassSelect';
import styles from '../../Catalog.module.scss';

type CatalogToolbarProps = {
  filters: CatalogFilterState;
  onChange: (patch: Partial<CatalogFilterState>) => void;
  visibleCount: number;
  totalCount: number;
};

const sortOptions: GlassSelectOption[] = [
  { value: 'popular', label: 'Сначала популярные' },
  { value: 'newest', label: 'Сначала новые' },
  { value: 'priceAsc', label: 'Сначала дешевле' },
  { value: 'priceDesc', label: 'Сначала дороже' },
];

export function CatalogToolbar({ filters, onChange, visibleCount, totalCount }: CatalogToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <p className={styles.resultsCount} aria-live="polite" aria-atomic="true">
          {visibleCount < totalCount
            ? <>Показано <strong>{visibleCount}</strong> из <strong>{totalCount}</strong></>
            : <><strong>{totalCount}</strong> {pluralize(totalCount, 'объявление', 'объявления', 'объявлений')}</>
          }
        </p>
      </div>
      <div className={styles.toolbarActions}>
        <GlassSelect
          label="Сортировка"
          value={filters.sortBy}
          options={sortOptions}
          onChange={(value) => onChange({ sortBy: value as CatalogFilterState['sortBy'] })}
          triggerClassName={styles.sortGlassTrigger}
          dropdownClassName={styles.sortDropdown}
        />
      </div>
    </div>
  );
}
