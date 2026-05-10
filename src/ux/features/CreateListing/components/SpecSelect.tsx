'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import styles from '../CreateListing.module.scss';

type SpecSelectProps = {
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
};

export function SpecSelect({ value, options, placeholder = 'Не выбрано', onChange }: SpecSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (opt: string) => {
      onChange(opt === value ? '' : opt);
      setOpen(false);
    },
    [onChange, value],
  );

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className={styles.specSelect} ref={ref}>
      <button
        type="button"
        className={clsx(styles.specTrigger, open && styles.specTriggerOpen, value && styles.specTriggerFilled)}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={value ? styles.specTriggerValue : styles.specTriggerPlaceholder}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={clsx(styles.specChevron, open && styles.specChevronOpen)}
        />
      </button>

      {open && (
        <div className={styles.specDropdown}>
          <div className={styles.specOptionsList}>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={clsx(styles.specOption, opt === value && styles.specOptionActive)}
                onClick={() => handleSelect(opt)}
              >
                <span>{opt}</span>
                {opt === value && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
