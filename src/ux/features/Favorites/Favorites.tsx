'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownUp,
  ArrowLeft,
  Heart,
  PackageSearch,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { getNumericPrice, pluralize, ROUTES } from '@/ux/utils';
import { CatalogCard } from '../Catalog/components/CatalogCard';
import { CatalogHeader } from '../Catalog/components/CatalogHeader';
import { ProductDetail } from '../Catalog/components/ProductDetail';
import { mockCatalogItems } from '../Catalog/mockCatalogItems';
import type { CatalogUiItem } from '../Catalog/types';
import styles from './Favorites.module.scss';

/* ─── Types ─── */
type SortOption = 'recent' | 'priceAsc' | 'priceDesc' | 'name';

const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Недавние',
  priceAsc: 'Сначала дешёвые',
  priceDesc: 'Сначала дорогие',
  name: 'По названию',
};

const EASE = [0.23, 1, 0.32, 1] as const;

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
          <motion.div
            className={styles.toolbar}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Поиск в избранном..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => setSearch('')}
                  aria-label="Очистить поиск"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className={styles.sortWrap}>
              <button
                type="button"
                className={styles.sortBtn}
                onClick={() => setSortOpen(!sortOpen)}
              >
                <ArrowDownUp size={14} />
                <span>{SORT_LABELS[sort]}</span>
              </button>

              <AnimatePresence>
                {sortOpen && (
                  <>
                    <motion.div
                      className={styles.sortBackdrop}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSortOpen(false)}
                    />
                    <motion.div
                      className={styles.sortDropdown}
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                    >
                      {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                        <button
                          key={key}
                          type="button"
                          className={sort === key ? styles.sortOptionActive : styles.sortOption}
                          onClick={() => { setSort(key); setSortOpen(false); }}
                        >
                          {SORT_LABELS[key]}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── Content ── */}
        {isEmpty ? (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className={styles.emptyIcon}>
              <Heart size={40} />
            </div>
            <h2 className={styles.emptyTitle}>Пока пусто</h2>
            <p className={styles.emptyText}>
              Нажмите <Heart size={14} className={styles.emptyHeartInline} /> на
              карточке вещи, чтобы добавить её в избранное и быстро вернуться к ней позже.
            </p>
            <Link href={ROUTES.search} className={styles.emptyBtn}>
              <PackageSearch size={16} />
              <span>Перейти в каталог</span>
            </Link>
          </motion.div>
        ) : favorites.length === 0 ? (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className={styles.emptyIcon}>
              <Search size={36} />
            </div>
            <h2 className={styles.emptyTitle}>Ничего не найдено</h2>
            <p className={styles.emptyText}>
              По запросу «{search}» ничего не нашлось в избранном.
            </p>
            <button
              type="button"
              className={styles.emptyBtn}
              onClick={() => setSearch('')}
            >
              Сбросить поиск
            </button>
          </motion.div>
        ) : (
          <motion.div
            className={styles.grid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="popLayout">
              {favorites.map((item, idx) => (
                <motion.div
                  key={item.id}
                  className={styles.cardWrap}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: removingId === item.id ? 0 : 1,
                    scale: removingId === item.id ? 0.9 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  <CatalogCard
                    item={item}
                    onOpen={handleOpen}
                    index={idx}
                    initialFavorite={true}
                    onFavoriteChange={(id, val) => { if (!val) handleRemove(id); }}
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => handleRemove(item.id)}
                    aria-label="Удалить из избранного"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
