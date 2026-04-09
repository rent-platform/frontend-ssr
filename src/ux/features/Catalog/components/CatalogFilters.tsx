import type { CatalogFilterState } from '../types';
import { CATEGORY_OPTIONS, QUICK_FILTER_OPTIONS } from '../utils';
import { RUSSIAN_CITY_OPTIONS } from '../russianCities';
import { GlassSelect, type GlassSelectOption } from './GlassSelect';
import styles from '../Catalog.module.scss';

type CatalogFiltersProps = {
  filters: CatalogFilterState;
  resultsCount: number;
  onChange: (patch: Partial<CatalogFilterState>) => void;
  onReset: () => void;
  onClose: () => void;
};

const PRICE_PRESETS = [
  { label: 'До 3 000 ₽', min: '', max: '3000' },
  { label: '3 000 – 10 000 ₽', min: '3000', max: '10000' },
  { label: 'От 10 000 ₽', min: '10000', max: '' },
] as const;

const categoryOptions: GlassSelectOption[] = CATEGORY_OPTIONS.map((option) => ({
  value: option,
  label: option,
}));

const cityOptions: GlassSelectOption[] = [
  {
    value: 'Все города',
    label: 'Все города России',
    description: 'Показывать объявления без ограничения по городу',
    searchText: 'все города России',
  },
  ...RUSSIAN_CITY_OPTIONS.map((city) => ({
    value: city.value,
    label: city.value,
    description: city.region,
    searchText: city.searchText,
  })),
];

function getResultsLabel(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return 'объявление';
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'объявления';
  }

  return 'объявлений';
}

export function CatalogFilters({
  filters,
  resultsCount,
  onChange,
  onReset,
  onClose,
}: CatalogFiltersProps) {
  const hasActiveFilters =
    filters.category !== 'Все категории' ||
    filters.city !== 'Новосибирск' ||
    Boolean(filters.quickFilter) ||
    Boolean(filters.minPrice.trim()) ||
    Boolean(filters.maxPrice.trim()) ||
    !filters.onlyAvailable ||
    filters.pricingMode !== 'day';

  const activeFilterLabels = [
    filters.category !== 'Все категории' ? filters.category : null,
    filters.city !== 'Новосибирск' ? filters.city : null,
    filters.quickFilter ? `Сценарий: ${filters.quickFilter}` : null,
    filters.minPrice ? `От ${filters.minPrice} ₽` : null,
    filters.maxPrice ? `До ${filters.maxPrice} ₽` : null,
    filters.onlyAvailable ? 'Только доступные сейчас' : 'Все предложения',
    filters.pricingMode === 'hour' ? 'Почасовой тариф' : 'Посуточный тариф',
  ].filter(Boolean) as string[];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitleRow}>
          <div>
            <p className={styles.sidebarEyebrow}>Фильтры</p>
            <h3>Уточните параметры поиска</h3>
          </div>
          <button
            type="button"
            onClick={onReset}
            className={styles.clearButton}
            disabled={!hasActiveFilters}
          >
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
          <p className={styles.filterHint}>
            Выберите категорию, город и бюджет — результаты обновляются сразу без отдельного
            подтверждения.
          </p>
        )}

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Категория</span>
          <GlassSelect
            label="Категория"
            value={filters.category}
            options={categoryOptions}
            onChange={(value) => onChange({ category: value })}
          />
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Город</span>
          <GlassSelect
            label="Город"
            value={filters.city}
            options={cityOptions}
            onChange={(value) => onChange({ city: value })}
            searchable
            searchPlaceholder="Введите город России"
            dropdownClassName={styles.cityDropdown}
            initialVisibleCount={12}
            maxVisibleCount={90}
          />
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Тариф</span>
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

        <div className={styles.filtersFooter}>
          <button type="button" className={styles.clearButton} onClick={onClose}>
            Закрыть
          </button>
          <button type="button" className={styles.primaryAction} onClick={onClose}>
            Показать {resultsCount} {getResultsLabel(resultsCount)}
          </button>
        </div>
      </div>
    </aside>
  );
}
