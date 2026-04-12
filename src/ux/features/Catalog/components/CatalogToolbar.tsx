import type { CatalogFilterState } from '../types';
import { GlassSelect, type GlassSelectOption } from './GlassSelect';
import styles from '../Catalog.module.scss';

type CatalogToolbarProps = {
  total: number;
  visible: number;
  filters: CatalogFilterState;
  onChange: (patch: Partial<CatalogFilterState>) => void;
};

const sortOptions: GlassSelectOption[] = [
  { value: 'popular', label: 'Сначала популярные' },
  { value: 'newest', label: 'Сначала новые' },
  { value: 'priceAsc', label: 'Сначала дешевле' },
  { value: 'priceDesc', label: 'Сначала дороже' },
];

export function CatalogToolbar({ total, visible, filters, onChange }: CatalogToolbarProps) {
  return (
    <div className={styles.toolbar}>
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
