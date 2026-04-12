'use client';

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
  return (
    <div className={clsx(styles.root, styles[variant], className)}>
      <div className={styles.list} role="tablist" aria-orientation="horizontal">
        {items.map(({ value: itemValue, label, icon: Icon, badge }) => {
          const active = itemValue === value;

          return (
            <button
              key={itemValue}
              type="button"
              role="tab"
              aria-selected={active}
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
