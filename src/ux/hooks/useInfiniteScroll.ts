'use client';

import { useEffect, useRef } from 'react';

export type UseInfiniteScrollOptions = {
  /** Whether there are more items to load. */
  hasMore: boolean;
  /** Called when the sentinel becomes visible. */
  onLoadMore: () => void;
  /** Pause observation (e.g. when a detail view is open). */
  disabled?: boolean;
  /** IntersectionObserver rootMargin. Default `'360px 0px'`. */
  rootMargin?: string;
};

/**
 * Observes a sentinel element and calls `onLoadMore` when it enters the viewport.
 * Returns a ref to attach to the sentinel `<div>`.
 */
export function useInfiniteScroll({
  hasMore,
  onLoadMore,
  disabled = false,
  rootMargin = '360px 0px',
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || disabled || !sentinelRef.current) return undefined;

    const node = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, disabled, onLoadMore, rootMargin]);

  return sentinelRef;
}
