import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ModerationQueueItem, ModerationQueueFilter } from '../types';
import { mockModerationQueue } from '../mockModeratorData';

const INITIAL_FILTER: ModerationQueueFilter = {
  search: '',
  sortBy: 'newest',
};

export function useModerationQueue() {
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
  const [filter, setFilter] = useState<ModerationQueueFilter>(INITIAL_FILTER);
  const [selectedItem, setSelectedItem] = useState<ModerationQueueItem | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems([...mockModerationQueue]);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.ownerName.toLowerCase().includes(q) ||
          item.city?.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.submittedAt).getTime();
      const dateB = new Date(b.submittedAt).getTime();
      return filter.sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [items, filter]);

  const approveItem = useCallback(
    (id: string) => {
      setProcessingId(id);
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
        setProcessingId(null);
      }, 400);
    },
    [selectedItem],
  );

  const openRejectModal = useCallback((item: ModerationQueueItem) => {
    setSelectedItem(item);
    setShowRejectModal(true);
    setRejectComment('');
  }, []);

  const confirmReject = useCallback(() => {
    if (!selectedItem) return;
    setProcessingId(selectedItem.id);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setSelectedItem(null);
      setShowRejectModal(false);
      setRejectComment('');
      setProcessingId(null);
    }, 400);
  }, [selectedItem]);

  const updateFilter = useCallback((patch: Partial<ModerationQueueFilter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    items: filteredItems,
    allCount: items.length,
    filter,
    updateFilter,
    selectedItem,
    setSelectedItem,
    isLoading,
    processingId,
    approveItem,
    openRejectModal,
    showRejectModal,
    setShowRejectModal,
    rejectComment,
    setRejectComment,
    confirmReject,
  };
}
