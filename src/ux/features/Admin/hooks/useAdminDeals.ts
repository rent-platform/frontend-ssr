import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminDeal, DealsFilter } from '../types';
import type { DealStatus } from '@/business/deals';
import { mockAdminDeals } from '../mockAdminData';

const INITIAL_FILTER: DealsFilter = {
  search: '',
  status: 'all',
};

export function useAdminDeals() {
  const [items, setItems] = useState<AdminDeal[]>([]);
  const [filter, setFilter] = useState<DealsFilter>(INITIAL_FILTER);
  const [selectedDeal, setSelectedDeal] = useState<AdminDeal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems([...mockAdminDeals]);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.itemTitle.toLowerCase().includes(q) ||
          d.renterName.toLowerCase().includes(q) ||
          d.ownerName.toLowerCase().includes(q),
      );
    }

    if (filter.status !== 'all') {
      result = result.filter((d) => d.status === filter.status);
    }

    return result;
  }, [items, filter]);

  const cancelDeal = useCallback((id: string, reason: string) => {
    setItems((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'CANCELLED' as DealStatus,
              rejectionReason: reason,
              history: [
                ...(d.history ?? []),
                {
                  id: `h-cancel-${Date.now()}`,
                  dealId: id,
                  oldStatus: d.status,
                  newStatus: 'CANCELLED' as DealStatus,
                  changedBy: 'admin',
                  changeSource: 'admin',
                  comment: reason,
                  changedAt: new Date().toISOString(),
                },
              ],
            }
          : d,
      ),
    );
    setSelectedDeal(null);
  }, []);

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    items.forEach((d) => { counts[d.status] = (counts[d.status] || 0) + 1; });
    return counts;
  }, [items]);

  const updateFilter = useCallback((patch: Partial<DealsFilter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    items: filteredItems,
    countByStatus,
    filter,
    updateFilter,
    selectedDeal,
    setSelectedDeal,
    isLoading,
    cancelDeal,
  };
}
