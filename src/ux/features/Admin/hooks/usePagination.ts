import { useMemo, useState, useCallback } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
  perPageOptions?: number[];
}

export interface UsePaginationReturn<T> {
  page: number;
  perPage: number;
  perPageOptions: number[];
  totalItems: number;
  totalPages: number;
  paginatedItems: T[];
  startIndex: number;
  endIndex: number;
  setPage: (p: number) => void;
  setPerPage: (pp: number) => void;
  goNext: () => void;
  goPrev: () => void;
  goFirst: () => void;
  goLast: () => void;
  getPageNumbers: () => (number | 'ellipsis')[];
}

const DEFAULT_PER_PAGE_OPTIONS = [10, 25, 50];

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {},
): UsePaginationReturn<T> {
  const {
    initialPage = 1,
    initialPerPage = 10,
    perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
  } = options;

  const [page, setPageRaw] = useState(initialPage);
  const [perPage, setPerPageRaw] = useState(initialPerPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const safePage = Math.min(page, totalPages);

  const setPage = useCallback((p: number) => {
    setPageRaw(Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  const setPerPage = useCallback((pp: number) => {
    setPerPageRaw(pp);
    setPageRaw(1);
  }, []);

  const goNext = useCallback(() => setPage(safePage + 1), [safePage, setPage]);
  const goPrev = useCallback(() => setPage(safePage - 1), [safePage, setPage]);
  const goFirst = useCallback(() => setPage(1), [setPage]);
  const goLast = useCallback(() => setPage(totalPages), [totalPages, setPage]);

  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalItems);

  const paginatedItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex],
  );

  const getPageNumbers = useCallback((): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push('ellipsis');
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safePage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  return {
    page: safePage,
    perPage,
    perPageOptions,
    totalItems,
    totalPages,
    paginatedItems,
    startIndex,
    endIndex,
    setPage,
    setPerPage,
    goNext,
    goPrev,
    goFirst,
    goLast,
    getPageNumbers,
  };
}
