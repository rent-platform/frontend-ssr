import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Complaint, ComplaintsFilter, ComplaintStatus } from '../types';
import { mockComplaints } from '../mockModeratorData';

const INITIAL_FILTER: ComplaintsFilter = {
  search: '',
  status: 'all',
  priority: 'all',
  target: 'all',
};

export function useComplaints() {
  const [items, setItems] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<ComplaintsFilter>(INITIAL_FILTER);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [moderatorComment, setModeratorComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems([...mockComplaints]);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.targetTitle.toLowerCase().includes(q) ||
          c.reporterName.toLowerCase().includes(q) ||
          c.reason.toLowerCase().includes(q),
      );
    }

    if (filter.status !== 'all') {
      result = result.filter((c) => c.status === filter.status);
    }

    if (filter.priority !== 'all') {
      result = result.filter((c) => c.priority === filter.priority);
    }

    if (filter.target !== 'all') {
      result = result.filter((c) => c.target === filter.target);
    }

    return result;
  }, [items, filter]);

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { all: items.length, new: 0, in_review: 0, resolved: 0, dismissed: 0 };
    items.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  }, [items]);

  const updateStatus = useCallback(
    (id: string, newStatus: ComplaintStatus, comment?: string) => {
      setItems((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: newStatus,
                resolvedAt: newStatus === 'resolved' || newStatus === 'dismissed' ? new Date().toISOString() : c.resolvedAt,
                moderatorComment: comment ?? c.moderatorComment,
              }
            : c,
        ),
      );
      if (selectedComplaint?.id === id) {
        setSelectedComplaint(null);
      }
    },
    [selectedComplaint],
  );

  const updateFilter = useCallback((patch: Partial<ComplaintsFilter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    items: filteredItems,
    countByStatus,
    filter,
    updateFilter,
    selectedComplaint,
    setSelectedComplaint,
    moderatorComment,
    setModeratorComment,
    isLoading,
    updateStatus,
  };
}
