'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, PackageSearch, Search } from 'lucide-react';
import { ROUTES, EASE } from '@/ux/utils';
import styles from '../Favorites.module.scss';

export type FavoritesEmptyStateProps = {
  isEmpty: boolean;
  search: string;
  onClearSearch: () => void;
};

export function FavoritesEmptyState({ isEmpty, search, onClearSearch }: FavoritesEmptyStateProps) {
  if (isEmpty) {
    return (
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
    );
  }

  return (
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
        onClick={onClearSearch}
      >
        Сбросить поиск
      </button>
    </motion.div>
  );
}
