import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminPayment, FinanceFilter, FinanceSummary } from '../types';
import type { PaymentStatus } from '@/business/payments';
import { mockAdminPayments, mockFinanceSummary } from '../mockAdminData';

const INITIAL_FILTER: FinanceFilter = {
  search: '',
  status: 'all',
};

export function useAdminFinance() {
  const [items, setItems] = useState<AdminPayment[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [filter, setFilter] = useState<FinanceFilter>(INITIAL_FILTER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems([...mockAdminPayments]);
      setSummary({ ...mockFinanceSummary });
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.itemTitle.toLowerCase().includes(q) ||
          p.renterName.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q),
      );
    }

    if (filter.status !== 'all') {
      result = result.filter((p) => p.status === filter.status);
    }

    return result;
  }, [items, filter]);

  const refundPayment = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((p) =>
        p.paymentId === id ? { ...p, status: 'REFUNDED' as PaymentStatus } : p,
      ),
    );
  }, []);

  const updateFilter = useCallback((patch: Partial<FinanceFilter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    items: filteredItems,
    summary,
    filter,
    updateFilter,
    isLoading,
    refundPayment,
  };
}
