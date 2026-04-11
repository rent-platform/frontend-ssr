'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../Catalog.module.scss';

export type GlassSelectOption = {
  value: string;
  label: string;
  description?: string;
  searchText?: string;
};

type GlassSelectProps = {
  label: string;
  value: string;
  options: GlassSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  initialVisibleCount?: number;
  maxVisibleCount?: number;
};

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.glassSelectChevron}>
      <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GlassSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Выбрать',
  searchable = false,
  searchPlaceholder = 'Начните вводить',
  triggerClassName,
  dropdownClassName,
  initialVisibleCount = 10,
  maxVisibleCount = 80,
}: GlassSelectProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return searchable ? options.slice(0, initialVisibleCount) : options;
    }

    return options
      .filter((option) => {
        const source = `${option.label} ${option.description ?? ''} ${option.searchText ?? ''}`.toLowerCase();
        return source.includes(normalizedQuery);
      })
      .slice(0, maxVisibleCount);
  }, [initialVisibleCount, maxVisibleCount, options, query, searchable]);

  const totalMatches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options.length;
    }

    return options.filter((option) => {
      const source = `${option.label} ${option.description ?? ''} ${option.searchText ?? ''}`.toLowerCase();
      return source.includes(normalizedQuery);
    }).length;
  }, [options, query]);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={styles.glassSelect}>
      <span className={styles.visuallyHidden}>{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={triggerClassName ?? styles.glassSelectTrigger}
        onClick={() => {
          setOpen((prev) => !prev);
          if (open) setQuery('');
        }}
      >
        <span className={styles.glassSelectTriggerText}>{selectedOption?.label ?? placeholder}</span>
        <ChevronIcon />
      </button>

      {open ? (
        <div className={`${styles.glassSelectDropdown}${dropdownClassName ? ` ${dropdownClassName}` : ''}`}>
          {searchable ? (
            <div className={styles.glassSelectSearchWrap}>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={styles.glassSelectSearchInput}
                placeholder={searchPlaceholder}
              />
            </div>
          ) : null}

          <div className={styles.glassSelectOptions} role="listbox" aria-label={label}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const active = option.value === value;

                return (
                  <button
                    key={`${option.value}-${option.label}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={active ? styles.glassSelectOptionActive : styles.glassSelectOption}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className={styles.glassSelectOptionLabel}>{option.label}</span>
                    {option.description ? (
                      <span className={styles.glassSelectOptionDescription}>{option.description}</span>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className={styles.glassSelectEmpty}>Ничего не найдено</div>
            )}
          </div>

          {searchable ? (
            <div className={styles.glassSelectFooter}>
              {query.trim()
                ? `Найдено: ${totalMatches}`
                : 'Начни вводить название города — список будет отсекаться автоматически.'}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
