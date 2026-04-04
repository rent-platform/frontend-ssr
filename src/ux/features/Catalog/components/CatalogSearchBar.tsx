import type { CatalogFilterState } from '../types';
import { CATEGORY_OPTIONS } from '../utils';
import { RUSSIAN_CITY_OPTIONS } from '../russianCities';
import { GlassSelect, type GlassSelectOption } from './GlassSelect';
import styles from '../Catalog.module.scss';

type CatalogSearchBarProps = {
  filters: CatalogFilterState;
  onChange: (patch: Partial<CatalogFilterState>) => void;
};

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

export function CatalogSearchBar({ filters, onChange }: CatalogSearchBarProps) {
  return (
    <section className={styles.searchShell}>
      <div className={styles.searchBar}>
        <GlassSelect
          label="Категория"
          value={filters.category}
          options={categoryOptions}
          onChange={(value) => onChange({ category: value })}
          triggerClassName={styles.categoryGlassTrigger}
        />

        <label className={styles.searchInputWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            className={styles.searchInput}
            placeholder="Поиск по объявлениям"
          />
        </label>

        <button type="button" className={styles.searchButton}>
          Найти
        </button>

        <GlassSelect
          label="Город"
          value={filters.city}
          options={cityOptions}
          onChange={(value) => onChange({ city: value })}
          searchable
          searchPlaceholder="Введите город России"
          triggerClassName={styles.cityGlassTrigger}
          dropdownClassName={styles.cityDropdown}
          initialVisibleCount={12}
          maxVisibleCount={90}
        />
      </div>

      <div className={styles.searchMetaRow}>
        <p>
          Арендуй технику, инструменты, вещи для дома через удобный сервис
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
