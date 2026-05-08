import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ModeratedReview, ReviewsModerationFilter } from '../types';
import { mockModeratedReviews } from '../mockModeratorData';

const INITIAL_FILTER: ReviewsModerationFilter = {
  search: '',
  flagged: 'all',
  minRating: 1,
  maxRating: 5,
};

export function useReviewsModeration() {
  const [items, setItems] = useState<ModeratedReview[]>([]);
  const [filter, setFilter] = useState<ReviewsModerationFilter>(INITIAL_FILTER);
  const [selectedReview, setSelectedReview] = useState<ModeratedReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setItems([...mockModeratedReviews]);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.text?.toLowerCase().includes(q) ||
          r.reviewerName.toLowerCase().includes(q) ||
          r.itemTitle.toLowerCase().includes(q),
      );
    }

    if (filter.flagged === 'flagged') {
      result = result.filter((r) => r.isFlagged);
    } else if (filter.flagged === 'clean') {
      result = result.filter((r) => !r.isFlagged);
    }

    result = result.filter((r) => r.rating >= filter.minRating && r.rating <= filter.maxRating);

    return result;
  }, [items, filter]);

  const flaggedCount = useMemo(() => items.filter((r) => r.isFlagged).length, [items]);

  const deleteReview = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((r) => r.id !== id));
      if (selectedReview?.id === id) setSelectedReview(null);
    },
    [selectedReview],
  );

  const clearFlag = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, isFlagged: false, flagReason: undefined } : r,
        ),
      );
    },
    [],
  );

  const updateFilter = useCallback((patch: Partial<ReviewsModerationFilter>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    items: filteredItems,
    totalCount: items.length,
    flaggedCount,
    filter,
    updateFilter,
    selectedReview,
    setSelectedReview,
    isLoading,
    deleteReview,
    clearFlag,
  };
}
