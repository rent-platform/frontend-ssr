import { motion } from 'framer-motion';
import type { CatalogUiItem } from '../types';
import {
  formatCatalogCardHourSecondary,
  formatCatalogCardLocation,
  formatCatalogCardPrimaryPrice,
  formatDepositAmount,
} from '../utils';
import styles from './CatalogCard.module.scss';

type CatalogCardProps = {
  item: CatalogUiItem;
  pricingMode?: 'day' | 'hour';
  onOpen?: (item: CatalogUiItem) => void;
  index?: number;
};

export function CatalogCard({ item, onOpen = () => {}, index = 0 }: CatalogCardProps) {
  const hourSecondary = formatCatalogCardHourSecondary(item);

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
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <img src={item.imageUrl ?? item.images[0]} alt={item.title} className={styles.cardImage} />
          <div className={styles.cardImageMeta}>
            {item.featured ? <span className={styles.cardFeatured}>Топ</span> : null}
            <span className={styles.cardAvailability}>{item.dateAvailable}</span>
          </div>
        </motion.div>
      </button>

      <div className={styles.cardBody}>
        <button type="button" onClick={() => onOpen(item)} className={styles.cardTitleButton}>
          {item.title}
        </button>

        <div className={styles.cardPriceRow}>
          <div className={styles.cardPriceBlock}>
            <strong>{formatCatalogCardPrimaryPrice(item)}</strong>
            {hourSecondary ? <span>{hourSecondary}</span> : null}
          </div>
          <span className={styles.cardDepositBadge}>Залог {formatDepositAmount(item.deposit_amount)}</span>
        </div>

        <p className={styles.cardLocationLine}>{formatCatalogCardLocation(item)}</p>
      </div>
    </motion.article>
  );
}
