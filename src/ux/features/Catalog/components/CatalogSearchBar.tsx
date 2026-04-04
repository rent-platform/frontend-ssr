import type { CatalogFilterState } from '../types';
import { CATEGORY_OPTIONS, CITY_OPTIONS } from '../utils';
import styles from '../Catalog.module.scss';

type CatalogSearchBarProps = {
  filters: CatalogFilterState;
  onChange: (patch: Partial<CatalogFilterState>) => void;
};

export function CatalogSearchBar({ filters, onChange }: CatalogSearchBarProps) {
  return (
    <section className={styles.searchShell}>
      <div className={styles.searchBar}>
        <label className={styles.categorySelectWrap}>
          <span className={styles.visuallyHidden}>Категория</span>
          <select
            value={filters.category}
            onChange={(event) => onChange({ category: event.target.value })}
            className={styles.categorySelect}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.searchInputWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            className={styles.searchInput}
            placeholder="Поиск по объявлениям, категориям и тегам"
          />
        </label>

        <label className={styles.citySelectWrap}>
          <span className={styles.visuallyHidden}>Город</span>
          <select
            value={filters.city}
            onChange={(event) => onChange({ city: event.target.value })}
            className={styles.citySelect}
          >
            {CITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className={styles.searchButton}>
          Найти
        </button>
      </div>

      <div className={styles.searchMetaRow}>
        <p>
          От камер и проекторов до колясок и инструментов — арендуй вещь только на тот
          срок, когда она нужна.
        </p>
        <div className={styles.pricingSwitch}>
          <button
            type="button"
            className={filters.pricingMode === 'day' ? styles.switchActive : styles.switchButton}
            onClick={() => onChange({ pricingMode: 'day' })}
          >
            За сутки
          </button>
          <button
            type="button"
            className={filters.pricingMode === 'hour' ? styles.switchActive : styles.switchButton}
            onClick={() => onChange({ pricingMode: 'hour' })}
          >
            За час
          </button>
        </div>
      </div>
    </section>
  );
}
