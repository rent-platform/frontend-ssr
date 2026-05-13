'use client';

import { ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';

export function SortableHeader<K extends string>({
  label,
  sortKey,
  currentKey,
  direction,
  onToggle,
}: {
  label: string;
  sortKey: K;
  currentKey: K | null;
  direction: 'asc' | 'desc';
  onToggle: (key: K) => void;
}) {
  const isActive = currentKey === sortKey;
  return (
    <th>
      <button className={s.sortableHeader} onClick={() => onToggle(sortKey)}>
        {label}
        <ArrowUpDown
          size={12}
          className={clsx(s.sortIcon, isActive && s.sortIconActive, isActive && direction === 'desc' && s.sortIconDesc)}
        />
      </button>
    </th>
  );
}
