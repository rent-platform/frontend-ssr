import { useEffect, useRef, useState } from 'react';
import type { CatalogFilterState } from '../types';
import { CATEGORY_OPTIONS } from '../utils';
import { RUSSIAN_CITY_OPTIONS } from '../russianCities';
import { GlassSelect, type GlassSelectOption } from './GlassSelect';
import { CatalogFilters } from './CatalogFilters';
import styles from '../Catalog.module.scss';

type CatalogSearchBarProps = {
  filters: CatalogFilterState;
  onChange: (patch: Partial<CatalogFilterState>) => void;
  onResetFilters: () => void;
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

export function CatalogSearchBar({ filters, onChange, onResetFilters }: CatalogSearchBarProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const shellRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) {
        setIsFiltersOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section ref={shellRef} className={styles.searchShell}>
      <div className={styles.searchBar}>
        <GlassSelect
          label="Категория"
          value={filters.category}
          options={categoryOptions}
          onChange={(value) => onChange({ category: value })}
          triggerClassName={styles.categoryGlassTrigger}
        />

        <label className={styles.searchInputWrap} onClick={() => setIsFiltersOpen(true)}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            onFocus={() => setIsFiltersOpen(true)}
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
      </div>

      {isFiltersOpen ? (
        <div className={styles.searchFiltersPanel}>
          <CatalogFilters filters={filters} onChange={onChange} onReset={onResetFilters} />
        </div>
      ) : null}
    </section>
  );
}
