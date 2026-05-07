import { useCallback, useMemo, useState } from 'react';
import { getNumericPrice } from '@/ux/utils';
import { mockCatalogItems, type CatalogUiItem } from '../../Catalog';
import type { SortOption } from '../types';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(mockCatalogItems.slice(0, 5).map((i) => i.id)),
  );
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');
  const [sortOpen, setSortOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<CatalogUiItem | null>(null);

  const favorites = useMemo(() => {
    let items = mockCatalogItems.filter((i) => favoriteIds.has(i.id));

    // search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.city ?? '').toLowerCase().includes(q),
      );
    }

    // sort
    switch (sort) {
      case 'priceAsc':
        items.sort((a, b) => getNumericPrice(a.pricePerDay ?? null) - getNumericPrice(b.pricePerDay ?? null));
        break;
      case 'priceDesc':
        items.sort((a, b) => getNumericPrice(b.pricePerDay ?? null) - getNumericPrice(a.pricePerDay ?? null));
        break;
      case 'name':
        items.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
        break;
      default:
        break;
    }

    return items;
  }, [favoriteIds, search, sort]);

  const handleRemove = useCallback((id: string) => {
    setRemovingId(id);
    // animate out, then remove
    setTimeout(() => {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setRemovingId(null);
    }, 280);
  }, []);

  const handleClearAll = useCallback(() => {
    setFavoriteIds(new Set());
    setSearch('');
  }, []);

  const handleOpen = useCallback((item: CatalogUiItem) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBack = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const similarItems = useMemo(() => {
    if (!selectedItem) return [];
    return mockCatalogItems
      .filter((i) => i.id !== selectedItem.id && i.category === selectedItem.category)
      .slice(0, 4);
  }, [selectedItem]);

  const isEmpty = favoriteIds.size === 0;

  return {
    favoriteIds,
    search,
    setSearch,
    sort,
    setSort,
    sortOpen,
    setSortOpen,
    removingId,
    selectedItem,
    favorites,
    similarItems,
    isEmpty,
    handleRemove,
    handleClearAll,
    handleOpen,
    handleBack,
  };
}
