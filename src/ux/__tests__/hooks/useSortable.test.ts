import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSortable } from '@/ux/hooks/useSortable';

type Item = { name: string; price: number };

const items: Item[] = [
  { name: 'Камера', price: 3500 },
  { name: 'Дрон', price: 4000 },
  { name: 'Перфоратор', price: 600 },
];

const accessors = {
  name: (item: Item) => item.name,
  price: (item: Item) => item.price,
};

describe('useSortable', () => {
  it('без defaultSort — сортировка не применяется', () => {
    const { result } = renderHook(() => useSortable(items, accessors));
    expect(result.current.sortKey).toBeNull();
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.sortedItems).toEqual(items);
  });

  it('toggleSort устанавливает ключ сортировки', () => {
    const { result } = renderHook(() => useSortable(items, accessors));
    act(() => result.current.toggleSort('price'));
    expect(result.current.sortKey).toBe('price');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('toggleSort переключает asc → desc при повторном вызове', () => {
    const { result } = renderHook(() => useSortable(items, accessors));

    act(() => result.current.toggleSort('price'));
    expect(result.current.sortDirection).toBe('asc');

    act(() => result.current.toggleSort('price'));
    expect(result.current.sortDirection).toBe('desc');
  });

  it('toggleSort сбрасывает на asc при смене ключа', () => {
    const { result } = renderHook(() => useSortable(items, accessors));

    act(() => result.current.toggleSort('price'));
    act(() => result.current.toggleSort('price')); // → desc
    act(() => result.current.toggleSort('name'));   // → asc
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.sortKey).toBe('name');
  });

  it('сортирует числа по возрастанию', () => {
    const { result } = renderHook(() => useSortable(items, accessors));
    act(() => result.current.toggleSort('price'));
    expect(result.current.sortedItems.map((i) => i.price)).toEqual([600, 3500, 4000]);
  });

  it('сортирует числа по убыванию', () => {
    const { result } = renderHook(() => useSortable(items, accessors));
    act(() => result.current.toggleSort('price'));
    act(() => result.current.toggleSort('price'));
    expect(result.current.sortedItems.map((i) => i.price)).toEqual([4000, 3500, 600]);
  });

  it('сортирует строки', () => {
    const { result } = renderHook(() => useSortable(items, accessors));
    act(() => result.current.toggleSort('name'));
    const names = result.current.sortedItems.map((i) => i.name);
    expect(names[0]).toBe('Дрон');
    expect(names[1]).toBe('Камера');
    expect(names[2]).toBe('Перфоратор');
  });

  it('resetSort сбрасывает к default (null)', () => {
    const { result } = renderHook(() => useSortable(items, accessors));
    act(() => result.current.toggleSort('price'));
    act(() => result.current.resetSort());
    expect(result.current.sortKey).toBeNull();
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.sortedItems).toEqual(items);
  });

  it('defaultSort применяется при инициализации', () => {
    const { result } = renderHook(() =>
      useSortable(items, accessors, { key: 'price', direction: 'desc' }),
    );
    expect(result.current.sortKey).toBe('price');
    expect(result.current.sortDirection).toBe('desc');
    expect(result.current.sortedItems[0].price).toBe(4000);
  });

  it('не мутирует исходный массив', () => {
    const original = [...items];
    const { result } = renderHook(() => useSortable(items, accessors));
    act(() => result.current.toggleSort('price'));
    expect(items).toEqual(original);
  });
});
