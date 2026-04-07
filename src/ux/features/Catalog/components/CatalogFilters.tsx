import type { CatalogFilterState } from '../types';
import { QUICK_FILTER_OPTIONS } from '../utils';
import styles from '../Catalog.module.scss';

type CatalogFiltersProps = {
  filters: CatalogFilterState;
  onChange: (patch: Partial<CatalogFilterState>) => void;
  onReset: () => void;
};

const PRICE_PRESETS = [
  { label: 'До 3 000 ₽', min: '', max: '3000' },
  { label: '3 000 - 10 000 ₽', min: '3000', max: '10000' },
  { label: 'От 10 000 ₽', min: '10000', max: '' },
] as const;

export function CatalogFilters({ filters, onChange, onReset }: CatalogFiltersProps) {
  const hasActiveFilters =
    Boolean(filters.quickFilter) ||
    Boolean(filters.minPrice.trim()) ||
    Boolean(filters.maxPrice.trim()) ||
    filters.onlyAvailable;

  const activeFilterLabels = [
    filters.quickFilter ? `Сценарий: ${filters.quickFilter}` : null,
    filters.minPrice ? `От ${filters.minPrice} ₽` : null,
    filters.maxPrice ? `До ${filters.maxPrice} ₽` : null,
    filters.onlyAvailable ? 'Только доступные сейчас' : null,
  ].filter(Boolean) as string[];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitleRow}>
          <div>
            <p className={styles.sidebarEyebrow}>Параметры поиска</p>
            <h3>Подберите вещь под сценарий</h3>
          </div>
          <button type="button" onClick={onReset} className={styles.clearButton} disabled={!hasActiveFilters}>
            Сбросить
          </button>
        </div>

        {activeFilterLabels.length ? (
          <div className={styles.activeFilters}>
            {activeFilterLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        ) : (
          <p className={styles.filterHint}>Выберите сценарий, бюджет и доступность - результат обновится сразу.</p>
        )}

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
          <div className={styles.pricePresets}>
            {PRICE_PRESETS.map((preset) => {
              const active = filters.minPrice === preset.min && filters.maxPrice === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  className={active ? styles.pricePresetActive : styles.pricePreset}
                  onClick={() => onChange({ minPrice: preset.min, maxPrice: preset.max })}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
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
            UI ждёт вью-модель карточки и параметры фильтрации - потом Илья подключит data hooks/store.
          </div>
        </div>
      </div>
    </aside>
  );
}
