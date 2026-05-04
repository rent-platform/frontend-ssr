'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    if (!open) return undefined;

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
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const compute = () => {
      const trigger = triggerRef.current;
      const dropdown = dropdownRef.current;
      if (!trigger || !dropdown) return;

      const rect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 12;
      const gap = 8;

      const width = Math.min(rect.width, viewportWidth - margin * 2);
      const left = Math.min(
        Math.max(margin, rect.left + rect.width / 2 - width / 2),
        viewportWidth - margin - width,
      );

      const availableBelow = viewportHeight - rect.bottom - margin - gap;
      const availableAbove = rect.top - margin - gap;
      const shouldOpenBelow = availableBelow >= 240 || availableBelow >= availableAbove;

      dropdown.style.position = 'fixed';
      dropdown.style.left = `${left}px`;
      dropdown.style.width = `${width}px`;
      dropdown.style.maxHeight = `${Math.max(180, shouldOpenBelow ? availableBelow : availableAbove)}px`;
      dropdown.style.zIndex = '2200';

      if (shouldOpenBelow) {
        dropdown.style.top = `${rect.bottom + gap}px`;
        dropdown.style.bottom = '';
        return;
      }

      dropdown.style.bottom = `${viewportHeight - rect.top + gap}px`;
      dropdown.style.top = '';
    };

    compute();

    const onViewportEvent = () => {
      requestAnimationFrame(compute);
    };

    window.addEventListener('resize', onViewportEvent);
    window.addEventListener('scroll', onViewportEvent, true);

    return () => {
      window.removeEventListener('resize', onViewportEvent);
      window.removeEventListener('scroll', onViewportEvent, true);
    };
  }, [open]);

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
    setHighlightIndex(-1);
  };

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
      } else if (e.key === 'Enter' && highlightIndex >= 0) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightIndex].value);
      }
    },
    [filteredOptions, highlightIndex],
  );

  return (
    <div ref={rootRef} className={styles.glassSelect}>
      <span className={styles.visuallyHidden}>{label}</span>
      <button
        ref={triggerRef}
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
        <div
          ref={dropdownRef}
          className={`${styles.glassSelectDropdown}${dropdownClassName ? ` ${dropdownClassName}` : ''}`}
          onKeyDown={handleListKeyDown}
        >
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

          <div
            className={styles.glassSelectOptions}
            role="listbox"
            aria-label={label}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const active = option.value === value;

                return (
                  <button
                    key={`${option.value}-${option.label}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    data-highlighted={index === highlightIndex || undefined}
                    className={active ? styles.glassSelectOptionActive : styles.glassSelectOption}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightIndex(index)}
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
