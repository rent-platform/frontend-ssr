import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePagination } from '@/ux/hooks/usePagination';

const items = Array.from({ length: 25 }, (_, i) => `item-${i + 1}`);

describe('usePagination', () => {
  it('правильно вычисляет totalPages', () => {
    const { result } = renderHook(() => usePagination(items, { initialPerPage: 10 }));
    expect(result.current.totalPages).toBe(3);
  });

  it('totalPages = 1 для пустого массива', () => {
    const { result } = renderHook(() => usePagination([]));
    expect(result.current.totalPages).toBe(1);
  });

  it('currentPage начинается с 1 по умолчанию', () => {
    const { result } = renderHook(() => usePagination(items));
    expect(result.current.page).toBe(1);
  });

  it('setPage ограничивает значение снизу до 1', () => {
    const { result } = renderHook(() => usePagination(items, { initialPerPage: 10 }));
    act(() => result.current.setPage(-5));
    expect(result.current.page).toBe(1);
  });

  it('currentPage не превышает totalPages', () => {
    const { result } = renderHook(() => usePagination(items, { initialPage: 100, initialPerPage: 10 }));
    expect(result.current.page).toBeLessThanOrEqual(result.current.totalPages);
  });

  it('goNext переходит на следующую страницу', () => {
    const { result } = renderHook(() => usePagination(items, { initialPerPage: 10 }));
    expect(result.current.page).toBe(1);

    act(() => result.current.goNext());
    expect(result.current.page).toBe(2);
  });

  it('goNext не превышает totalPages', () => {
    const { result } = renderHook(() => usePagination(items, { initialPage: 3, initialPerPage: 10 }));
    expect(result.current.page).toBe(3);

    act(() => result.current.goNext());
    expect(result.current.page).toBe(3);
  });

  it('goPrev переходит на предыдущую страницу', () => {
    const { result } = renderHook(() => usePagination(items, { initialPage: 2, initialPerPage: 10 }));
    expect(result.current.page).toBe(2);

    act(() => result.current.goPrev());
    expect(result.current.page).toBe(1);
  });

  it('goPrev не опускается ниже 1', () => {
    const { result } = renderHook(() => usePagination(items, { initialPage: 1, initialPerPage: 10 }));
    act(() => result.current.goPrev());
    expect(result.current.page).toBe(1);
  });

  it('goTo переходит на указанную страницу', () => {
    const { result } = renderHook(() => usePagination(items, { initialPerPage: 10 }));
    act(() => result.current.setPage(3));
    expect(result.current.page).toBe(3);
  });

  it('goFirst переходит на первую страницу', () => {
    const { result } = renderHook(() => usePagination(items, { initialPage: 3, initialPerPage: 10 }));
    act(() => result.current.goFirst());
    expect(result.current.page).toBe(1);
  });

  it('goLast переходит на последнюю страницу', () => {
    const { result } = renderHook(() => usePagination(items, { initialPerPage: 10 }));
    act(() => result.current.goLast());
    expect(result.current.page).toBe(3);
  });

  it('paginatedItems возвращает правильный срез', () => {
    const { result } = renderHook(() => usePagination(items, { initialPerPage: 10 }));
    expect(result.current.paginatedItems).toHaveLength(10);
    expect(result.current.paginatedItems[0]).toBe('item-1');
    expect(result.current.paginatedItems[9]).toBe('item-10');
  });

  it('последняя страница содержит остаток', () => {
    const { result } = renderHook(() => usePagination(items, { initialPage: 3, initialPerPage: 10 }));
    expect(result.current.paginatedItems).toHaveLength(5);
    expect(result.current.paginatedItems[0]).toBe('item-21');
  });

  it('setPerPage сбрасывает страницу на 1', () => {
    const { result } = renderHook(() => usePagination(items, { initialPage: 3, initialPerPage: 10 }));
    act(() => result.current.setPerPage(25));
    expect(result.current.page).toBe(1);
    expect(result.current.perPage).toBe(25);
  });

  it('startIndex и endIndex корректны', () => {
    const { result } = renderHook(() => usePagination(items, { initialPage: 2, initialPerPage: 10 }));
    expect(result.current.startIndex).toBe(10);
    expect(result.current.endIndex).toBe(20);
  });

  it('totalItems соответствует длине массива', () => {
    const { result } = renderHook(() => usePagination(items));
    expect(result.current.totalItems).toBe(25);
  });
});
