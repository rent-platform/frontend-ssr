'use client';

import { useCallback, useRef } from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import styles from './Tabs.module.scss';

export type TabsItem<T extends string> = {
  value: T;
  label: string;
  icon?: LucideIcon;
  badge?: string;
};

type TabsProps<T extends string> = {
  items: TabsItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'underline';
  className?: string;
};

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = 'underline',
  className,
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = items.findIndex((item) => item.value === value);
      let nextIndex: number | null = null;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % items.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + items.length) % items.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = items.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        onChange(items[nextIndex].value);
        const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        buttons?.[nextIndex]?.focus();
      }
    },
    [items, value, onChange],
  );

  return (
    <div className={clsx(styles.root, styles[variant], className)}>
      <div
        className={styles.list}
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
        ref={listRef}
      >
        {items.map(({ value: itemValue, label, icon: Icon, badge }) => {
          const active = itemValue === value;

          return (
            <button
              key={itemValue}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              className={active ? styles.tabActive : styles.tab}
              onClick={() => onChange(itemValue)}
            >
              {Icon ? <Icon className={styles.icon} /> : null}
              <span>{label}</span>
              {badge ? <span className={styles.badge}>{badge}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
