import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminUser, UsersFilter } from '../types';
import type { UserRole } from '@/business/auth';
import { mockAdminUsers } from '../mockAdminData';

const INITIAL_FILTER: UsersFilter = {
  search: '',
  role: 'all',
  status: 'all',
};

export function useAdminUsers() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState<UsersFilter>(INITIAL_FILTER);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems([...mockAdminUsers]);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone.includes(q) ||
          u.nickname?.toLowerCase().includes(q),
      );
    }

    if (filter.role !== 'all') {
      result = result.filter((u) => u.role === filter.role);
    }

    if (filter.status === 'active') {
      result = result.filter((u) => u.isActive);
    } else if (filter.status === 'banned') {
      result = result.filter((u) => !u.isActive);
    }

    return result;
  }, [items, filter]);

  const toggleBan = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)),
    );
  }, []);

  const changeRole = useCallback((id: string, role: UserRole) => {
    setItems((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u)),
    );
  }, []);

  const updateFilter = useCallback((patch: Partial<UsersFilter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  const countByRole = useMemo(() => {
    const counts: Record<string, number> = { all: items.length, user: 0, moderator: 0, admin: 0 };
    items.forEach((u) => { counts[u.role] = (counts[u.role] || 0) + 1; });
    return counts;
  }, [items]);

  return {
    items: filteredItems,
    countByRole,
    filter,
    updateFilter,
    selectedUser,
    setSelectedUser,
    isLoading,
    toggleBan,
    changeRole,
  };
}
