import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
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
  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <button type="button" className={styles.cardFavorite} aria-label="Добавить в избранное">
        ♡
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
          <span className={styles.cardCategory}>{item.category}</span>
          <div className={styles.cardRating}>
            <Star className={styles.starIcon} size={12} fill="#ffb800" color="#ffb800" />
            <strong>{item.ownerRating}</strong>
          </div>
        </div>

        <button type="button" onClick={() => onOpen(item)} className={styles.cardTitleButton}>
          {item.title}
        </button>

        <div className={styles.cardPriceRow}>
          <div className={styles.cardPriceBlock}>
            <strong>{formatCatalogCardPrimaryPrice(item)}</strong>
          </div>
          <span className={styles.cardDepositBadge}>Залог {formatDepositAmount(item.deposit_amount)}</span>
        </div>

        <div className={styles.cardFooter}>
          <p className={styles.cardLocationLine}>{formatCatalogCardLocation(item)}</p>
          <span className={styles.cardDate}>{item.dateAvailable}</span>
        </div>
      </div>
    </motion.article>
  );
}
