import { useCallback, useMemo, useState } from 'react';
import { mapCatalogShortItemToCardVM } from '@/business/ads';
import { useFetchMyFavoritesQuery, useRemoveFavoriteMutation } from '@/business/favorites/api';
import { showToast, useAppDispatch } from '@/business/shared';
import { getNumericPrice } from '@/ux/utils';
import type { CatalogUiItem } from '../../Catalog';
import type { SortOption } from '../types';

export function useFavorites() {
  const dispatch = useAppDispatch();
  const { data, isLoading, isFetching, isError } = useFetchMyFavoritesQuery({
    pageSize: 100,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  const [removeFavorite] = useRemoveFavoriteMutation();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('recent');
  const [sortOpen, setSortOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<CatalogUiItem | null>(null);

  const allFavorites = useMemo(
    () => (data?.content ?? []).map((item) => ({
      ...mapCatalogShortItemToCardVM(item),
      isFavorite: true,
      city: item.city ?? undefined,
    })),
    [data?.content],
  );

  const favoriteIds = useMemo(
    () => new Set(allFavorites.map((item) => item.id)),
    [allFavorites],
  );

  const favorites = useMemo(() => {
    let items = [...allFavorites];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.city ?? i.pickupLocation ?? '').toLowerCase().includes(q),
      );
    }

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
  }, [allFavorites, search, sort]);

  const handleRemove = useCallback(async (id: string) => {
    setRemovingId(id);
    try {
      await removeFavorite({ itemId: id }).unwrap();
    } catch {
      dispatch(showToast({ type: "error", message: "Не удалось удалить из избранного" }));
    } finally {
      setRemovingId(null);
    }
  }, [dispatch, removeFavorite]);

  const handleClearAll = useCallback(async () => {
    try {
      await Promise.all(allFavorites.map((item) => removeFavorite({ itemId: item.id }).unwrap()));
      setSearch('');
    } catch {
      dispatch(showToast({ type: "error", message: "Не удалось очистить избранное" }));
    }
  }, [allFavorites, dispatch, removeFavorite]);

  const handleOpen = useCallback((item: CatalogUiItem) => {
    setSelectedItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBack = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const similarItems = useMemo(() => {
    if (!selectedItem) return [];
    return allFavorites
      .filter((i) => i.id !== selectedItem.id && i.category === selectedItem.category)
      .slice(0, 4);
  }, [allFavorites, selectedItem]);

  const isEmpty = !isLoading && favoriteIds.size === 0;

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
    isLoading: isLoading || isFetching,
    isError,
    handleRemove,
    handleClearAll,
    handleOpen,
    handleBack,
  };
}
