'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { EASE } from '@/ux/utils';
import { CatalogCard, type CatalogUiItem } from '../../Catalog';
import styles from '../Favorites.module.scss';

export type FavoritesGridProps = {
  items: CatalogUiItem[];
  removingId: string | null;
  onOpen: (item: CatalogUiItem) => void;
  onRemove: (id: string) => void;
};

export function FavoritesGrid({ items, removingId, onOpen, onRemove }: FavoritesGridProps) {
  return (
    <motion.div
      className={styles.grid}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        {items.map((item, idx) => (
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
              onOpen={onOpen}
              index={idx}
              initialFavorite={true}
              onFavoriteChange={(id, val) => { if (!val) onRemove(id); }}
            />
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => onRemove(item.id)}
              aria-label="Удалить из избранного"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
