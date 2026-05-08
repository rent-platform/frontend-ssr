import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ActivityLogEntry, ActivityLogFilter, ActivityActionType } from '../types';
import { mockActivityLog } from '../mockAdminData';

const INITIAL_FILTER: ActivityLogFilter = {
  search: '',
  action: 'all',
  dateFrom: '',
  dateTo: '',
};

export function useAdminActivityLog() {
  const [items, setItems] = useState<ActivityLogEntry[]>([]);
  const [filter, setFilter] = useState<ActivityLogFilter>(INITIAL_FILTER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems([...mockActivityLog]);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.actionLabel.toLowerCase().includes(q) ||
          e.targetTitle.toLowerCase().includes(q) ||
          e.performedByName.toLowerCase().includes(q) ||
          e.details?.toLowerCase().includes(q),
      );
    }

    if (filter.action !== 'all') {
      result = result.filter((e) => e.action === filter.action);
    }

    if (filter.dateFrom) {
      const from = new Date(filter.dateFrom).getTime();
      result = result.filter((e) => new Date(e.performedAt).getTime() >= from);
    }

    if (filter.dateTo) {
      const to = new Date(filter.dateTo).getTime() + 86400000;
      result = result.filter((e) => new Date(e.performedAt).getTime() <= to);
    }

    result.sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());

    return result;
  }, [items, filter]);

  const updateFilter = useCallback((patch: Partial<ActivityLogFilter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(INITIAL_FILTER);
  }, []);

  return {
    items: filteredItems,
    totalCount: items.length,
    filter,
    updateFilter,
    resetFilter,
    isLoading,
  };
}
