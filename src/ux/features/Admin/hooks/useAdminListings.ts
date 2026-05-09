import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminListing, ListingsFilter } from '../types';
import type { ItemStatus } from '@/business/ads';
import { mockAdminListings } from '../mockAdminData';

const INITIAL_FILTER: ListingsFilter = {
  search: '',
  status: 'all',
  category: 'all',
};

export function useAdminListings() {
  const [items, setItems] = useState<AdminListing[]>([]);
  const [filter, setFilter] = useState<ListingsFilter>(INITIAL_FILTER);
  const [selectedItem, setSelectedItem] = useState<AdminListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems([...mockAdminListings]);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category?.categoryName) set.add(i.category.categoryName);
    });
    return ['all', ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.ownerName.toLowerCase().includes(q) ||
          i.city?.toLowerCase().includes(q),
      );
    }

    if (filter.status !== 'all') {
      result = result.filter((i) => i.status === filter.status);
    }

    if (filter.category !== 'all') {
      result = result.filter((i) => i.category?.categoryName === filter.category);
    }

    return result;
  }, [items, filter]);

  const forceArchive = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'ARCHIVED' as ItemStatus } : i)),
    );
  }, []);

  const approveListing = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'ACTIVE' as ItemStatus, moderationComment: undefined }
          : i,
      ),
    );
    setSelectedItem((prev) =>
      prev && prev.id === id
        ? { ...prev, status: 'ACTIVE' as ItemStatus, moderationComment: undefined }
        : prev,
    );
  }, []);

  const rejectListing = useCallback((id: string, comment: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'REJECTED' as ItemStatus, moderationComment: comment || undefined }
          : i,
      ),
    );
    setSelectedItem((prev) =>
      prev && prev.id === id
        ? { ...prev, status: 'REJECTED' as ItemStatus, moderationComment: comment || undefined }
        : prev,
    );
  }, []);

  const restoreFromArchive = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'ACTIVE' as ItemStatus } : i)),
    );
    setSelectedItem((prev) =>
      prev && prev.id === id ? { ...prev, status: 'ACTIVE' as ItemStatus } : prev,
    );
  }, []);

  const sendToModeration = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'MODERATION' as ItemStatus, moderationComment: undefined }
          : i,
      ),
    );
    setSelectedItem((prev) =>
      prev && prev.id === id
        ? { ...prev, status: 'MODERATION' as ItemStatus, moderationComment: undefined }
        : prev,
    );
  }, []);

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    items.forEach((i) => { counts[i.status] = (counts[i.status] || 0) + 1; });
    return counts;
  }, [items]);

  const updateFilter = useCallback((patch: Partial<ListingsFilter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    items: filteredItems,
    categories,
    countByStatus,
    filter,
    updateFilter,
    selectedItem,
    setSelectedItem,
    isLoading,
    forceArchive,
    approveListing,
    rejectListing,
    restoreFromArchive,
    sendToModeration,
  };
}
