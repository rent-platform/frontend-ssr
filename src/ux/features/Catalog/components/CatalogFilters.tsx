import type { CatalogFilterState } from '../types';
import { QUICK_FILTER_OPTIONS } from '../utils';
import styles from '../Catalog.module.scss';

type CatalogFiltersProps = {
  filters: CatalogFilterState;
  onChange: (patch: Partial<CatalogFilterState>) => void;
  onReset: () => void;
};

export function CatalogFilters({ filters, onChange, onReset }: CatalogFiltersProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitleRow}>
          <div>
            <p className={styles.sidebarEyebrow}>Фильтры</p>
            <h3>Подберите вещь под сценарий</h3>
          </div>
          <button type="button" onClick={onReset} className={styles.clearButton}>
            Сбросить
          </button>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Быстрые сценарии</span>
          <div className={styles.quickFilters}>
            {QUICK_FILTER_OPTIONS.map((option) => {
              const active = filters.quickFilter === option;

              return (
                <button
                  key={option}
                  type="button"
                  className={active ? styles.quickFilterActive : styles.quickFilter}
                  onClick={() => onChange({ quickFilter: active ? null : option })}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Стоимость</span>
          <div className={styles.priceFields}>
            <label>
              <span>От</span>
              <input
                value={filters.minPrice}
                onChange={(event) => onChange({ minPrice: event.target.value })}
                placeholder="0"
                inputMode="numeric"
              />
            </label>
            <label>
              <span>До</span>
              <input
                value={filters.maxPrice}
                onChange={(event) => onChange({ maxPrice: event.target.value })}
                placeholder="15000"
                inputMode="numeric"
              />
            </label>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Состояние выдачи</span>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={filters.onlyAvailable}
              onChange={(event) => onChange({ onlyAvailable: event.target.checked })}
            />
            <span>Только доступные сейчас</span>
          </label>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Подсказка по интеграции</span>
          <div className={styles.integrationHint}>
            UI ждёт вью-модель карточки и параметры фильтрации - потом подкл query и store 
          </div>
        </div>
      </div>
    </aside>
  );
}
