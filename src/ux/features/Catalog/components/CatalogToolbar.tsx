import type { CatalogFilterState } from '../types';
import styles from '../Catalog.module.scss';

type CatalogToolbarProps = {
  total: number;
  visible: number;
  filters: CatalogFilterState;
  onChange: (patch: Partial<CatalogFilterState>) => void;
};

export function CatalogToolbar({ total, visible, filters, onChange }: CatalogToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div>
        <h2>Объявления для аренды</h2>
        <p>
          Показано {Math.min(visible, total)} из {total} объявлений
        </p>
      </div>

      <div className={styles.toolbarActions}>
        <label className={styles.sortSelectWrap}>
          <span>Сортировка</span>
          <select
            value={filters.sortBy}
            onChange={(event) =>
              onChange({ sortBy: event.target.value as CatalogFilterState['sortBy'] })
            }
          >
            <option value="popular">Сначала популярные</option>
            <option value="newest">Сначала новые</option>
            <option value="priceAsc">Сначала дешевле</option>
            <option value="priceDesc">Сначала дороже</option>
          </select>
        </label>
      </div>
    </div>
  );
}
