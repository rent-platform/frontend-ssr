'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Trash2,
} from 'lucide-react';
import { pluralize, ROUTES, EASE } from '@/ux/utils';
import { CatalogHeader, ProductDetail } from '../Catalog';
import { FavoritesToolbar, FavoritesEmptyState, FavoritesGrid } from './components';
import { useFavorites } from './hooks/useFavorites';
import styles from './Favorites.module.scss';

/* ═══ Main component ═══ */
export function Favorites() {
  const {
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
  } = useFavorites();

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
