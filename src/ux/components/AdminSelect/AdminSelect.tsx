'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import s from '../../layouts/AdminLayout/AdminLayout.module.scss';

export type SelectOption = { value: string; label: string };

export function AdminSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={s.adminSelect}>
      <button
        type="button"
        className={clsx(s.adminSelectTrigger, open && s.adminSelectTriggerOpen)}
        onClick={() => setOpen((p) => !p)}
      >
        {selected?.label ?? '—'}
      </button>
      <ChevronDown size={14} className={clsx(s.adminSelectChevron, open && s.adminSelectChevronOpen)} />
      {open && (
        <div className={s.adminSelectDropdown}>
          <div className={s.adminSelectOptions}>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={opt.value === value ? s.adminSelectOptionActive : s.adminSelectOption}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
