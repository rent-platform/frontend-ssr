import { motion } from 'framer-motion';
import { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import type { CatalogUiItem } from '../types';
import {
  formatCatalogCardLocation,
  formatCatalogCardPrimaryPrice,
  formatDepositAmount,
} from '../utils';
import styles from './CatalogCard.module.scss';

type CatalogCardProps = {
  item: CatalogUiItem;
  onOpen?: (item: CatalogUiItem) => void;
  index?: number;
};

export function CatalogCard({ item, onOpen = () => {}, index = 0 }: CatalogCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <button
        type="button"
        className={`${styles.cardFavorite} ${isFavorite ? styles.cardFavoriteActive : ''}`}
        aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        onClick={(e) => {
          e.stopPropagation();
          setIsFavorite(!isFavorite);
        }}
      >
        <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      <button type="button" className={styles.cardImageButton} onClick={() => onOpen(item)}>
        <motion.div
          className={styles.cardImageWrap}
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        >
          <img src={item.imageUrl ?? item.images[0]} alt={item.title} className={styles.cardImage} />
          {item.featured && (
            <div className={styles.cardBadge}>
              <span className={styles.cardFeatured}>Топ</span>
            </div>
          )}
        </motion.div>
      </button>

      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <button type="button" onClick={() => onOpen(item)} className={styles.cardTitleButton}>
            {item.title}
          </button>
          <div className={styles.cardRating}>
            <Star className={styles.starIcon} size={12} fill="currentColor" color="currentColor" />
            <strong>{item.ownerRating}</strong>
          </div>
        </div>

        <p className={styles.cardLocationLine}>{formatCatalogCardLocation(item)}</p>

        <div className={styles.cardPriceRow}>
          <div className={styles.cardPriceBlock}>
            <strong>{formatCatalogCardPrimaryPrice(item)}</strong>
            <span>/ день</span>
          </div>
          {item.deposit_amount && (
            <span className={styles.cardDepositBadge}>Залог {formatDepositAmount(item.deposit_amount)}</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
