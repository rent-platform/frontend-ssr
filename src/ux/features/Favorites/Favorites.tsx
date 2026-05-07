'use client';

import { motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Trash2,
} from 'lucide-react';
import { getNumericPrice, pluralize, ROUTES, EASE } from '@/ux/utils';
import {
  CatalogHeader,
  ProductDetail,
  mockCatalogItems,
  type CatalogUiItem,
} from '../Catalog';
import type { SortOption } from './types';
import { FavoritesToolbar, FavoritesEmptyState, FavoritesGrid } from './components';
import styles from './Favorites.module.scss';

/* ═══ Main component ═══ */
export function Favorites() {
  // Mock: first 5 catalog items as "favorites", in real app — from API/store
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

  if (selectedItem) {
    return (
      <div className={styles.detailPage}>
        <CatalogHeader cityLabel="Новосибирск" onBrandClick={handleBack} />
        <main className={styles.detailMain}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <ProductDetail
              item={selectedItem}
              similarItems={similarItems}
              onBack={handleBack}
              onOpenSimilar={handleOpen}
            />
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Navigation ── */}
        <nav className={styles.nav}>
          <Link href={ROUTES.search} className={styles.navBack}>
            <ArrowLeft size={16} />
            <span>Каталог</span>
          </Link>
        </nav>

        {/* ── Header ── */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Heart size={20} />
            </div>
            <div className={styles.headerText}>
              <h1 className={styles.title}>Избранное</h1>
              <p className={styles.subtitle}>
                {isEmpty
                  ? 'Здесь будут ваши сохранённые вещи'
                  : `${favoriteIds.size} ${pluralize(favoriteIds.size, 'вещь', 'вещи', 'вещей')} сохранено`}
              </p>
            </div>
          </div>

          {!isEmpty && (
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.clearBtn}
                onClick={handleClearAll}
              >
                <Trash2 size={14} />
                <span>Очистить всё</span>
              </button>
            </div>
          )}
        </header>

        {/* ── Toolbar ── */}
        {!isEmpty && (
          <FavoritesToolbar
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            sortOpen={sortOpen}
            onSortOpenChange={setSortOpen}
          />
        )}

        {/* ── Content ── */}
        {isEmpty || favorites.length === 0 ? (
          <FavoritesEmptyState
            isEmpty={isEmpty}
            search={search}
            onClearSearch={() => setSearch('')}
          />
        ) : (
          <FavoritesGrid
            items={favorites}
            removingId={removingId}
            onOpen={handleOpen}
            onRemove={handleRemove}
          />
        )}
      </div>
    </div>
  );
}
