'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, MapPin, Search } from 'lucide-react';
import clsx from 'clsx';
import type { RussianCityOption } from '../../Catalog/russianCities';
import styles from '../CreateListing.module.scss';

type CitySelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CitySelect({ value, onChange }: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cities, setCities] = useState<RussianCityOption[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    import('../../Catalog/russianCities').then((m) => setCities(m.RUSSIAN_CITY_OPTIONS));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return cities.slice(0, 20);
    const q = search.toLowerCase();
    return cities.filter((c) => c.searchText.includes(q)).slice(0, 20);
  }, [search, cities]);

  const selectedCity = useMemo(
    () => cities.find((c) => c.value === value),
    [value, cities],
  );

  const handleSelect = useCallback(
    (cityValue: string) => {
      onChange(cityValue === value ? '' : cityValue);
      setOpen(false);
      setSearch('');
    },
    [onChange, value],
  );

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  return (
    <div className={styles.specSelect} ref={ref}>
      <button
        type="button"
        className={clsx(styles.specTrigger, open && styles.specTriggerOpen, value && styles.specTriggerFilled)}
        onClick={() => setOpen((v) => !v)}
      >
        {value ? (
          <span className={styles.specTriggerValue}>
            <MapPin size={14} style={{ flexShrink: 0 }} />
            {selectedCity?.label ?? value}
          </span>
        ) : (
          <span className={styles.specTriggerPlaceholder}>Выберите город</span>
        )}
        <ChevronDown
          size={16}
          className={clsx(styles.specChevron, open && styles.specChevronOpen)}
        />
      </button>

      {open && (
        <div className={styles.specDropdown}>
          <div className={styles.citySearchRow}>
            <Search size={14} />
            <input
              ref={searchRef}
              className={styles.citySearchField}
              placeholder="Начните вводить название города..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.specOptionsList}>
            {filtered.length === 0 ? (
              <div className={styles.cityNoResults}>Город не найден</div>
            ) : (
              filtered.map((city) => (
                <button
                  key={city.value}
                  type="button"
                  className={clsx(styles.specOption, city.value === value && styles.specOptionActive)}
                  onClick={() => handleSelect(city.value)}
                >
                  <span className={styles.cityOptionContent}>
                    <span className={styles.cityName}>{city.value}</span>
                    <span className={styles.cityRegion}>{city.region}</span>
                  </span>
                  {city.value === value && <Check size={14} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
