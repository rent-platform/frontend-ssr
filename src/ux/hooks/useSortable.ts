import { useMemo, useState, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortState<K extends string = string> {
  key: K | null;
  direction: SortDirection;
}

export interface UseSortableReturn<T, K extends string = string> {
  sortedItems: T[];
  sortKey: K | null;
  sortDirection: SortDirection;
  toggleSort: (key: K) => void;
  resetSort: () => void;
}

export function useSortable<T, K extends string = string>(
  items: T[],
  accessors: Partial<Record<K, (item: T) => string | number | boolean | null | undefined>>,
  defaultSort?: { key: K; direction: SortDirection },
): UseSortableReturn<T, K> {
  const [sort, setSort] = useState<SortState<K>>({
    key: defaultSort?.key ?? null,
    direction: defaultSort?.direction ?? 'asc',
  });

  const toggleSort = useCallback((key: K) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const resetSort = useCallback(() => {
    setSort({ key: null, direction: 'asc' });
  }, []);

  const sortedItems = useMemo(() => {
    if (!sort.key) return items;
    const accessor = accessors[sort.key];
    if (!accessor) return items;

    return [...items].sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;

      let cmp = 0;
      if (typeof va === 'string' && typeof vb === 'string') {
        cmp = va.localeCompare(vb, 'ru');
      } else if (typeof va === 'number' && typeof vb === 'number') {
        cmp = va - vb;
      } else if (typeof va === 'boolean' && typeof vb === 'boolean') {
        cmp = Number(va) - Number(vb);
      } else {
        cmp = String(va).localeCompare(String(vb), 'ru');
      }

      return sort.direction === 'desc' ? -cmp : cmp;
    });
  }, [items, sort, accessors]);

  return {
    sortedItems,
    sortKey: sort.key,
    sortDirection: sort.direction,
    toggleSort,
    resetSort,
  };
}
