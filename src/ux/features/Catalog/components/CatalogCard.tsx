import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  ChevronRight,
  Clock3,
  Eye,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import type { CatalogUiItem } from '../types';
import {
  formatCatalogCardHourSecondary,
  formatCatalogCardLocation,
  formatCatalogCardPrimaryPrice,
  formatDepositAmount,
  formatRelativeDate,
  formatViews,
} from '../utils';
import styles from './CatalogCard.module.scss';

type CatalogCardProps = {
  item: CatalogUiItem;
  onOpen?: (item: CatalogUiItem) => void;
  index?: number;
};

const highlightVisuals = {
  'С доставкой': Truck,
  'Рядом сегодня': Zap,
  'Без залога': ShieldCheck,
  'Топ-рейтинг': Star,
  Новинки: Sparkles,
} as const;

function getOwnerInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function isExternalImage(value: string | undefined) {
  return Boolean(value && /^https?:\/\//.test(value));
}

export function CatalogCard({ item, onOpen = () => {}, index = 0 }: CatalogCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const locationLabel = formatCatalogCardLocation(item);
  const publishedLabel = formatRelativeDate(item.created_at);
  const viewsLabel = formatViews(item.views_count);
  const secondaryPrice =
    formatCatalogCardHourSecondary(item) ??
    (item.deposit_amount
      ? `Залог ${formatDepositAmount(item.deposit_amount)}`
      : 'Без залога');
  const ownerAvatarValue = item.ownerAvatar?.trim();
  const ownerInitial = getOwnerInitial(item.ownerName);
  const highlightItems = item.quickFilters.slice(0, 2);

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
        onClick={(event) => {
          event.stopPropagation();
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

          <div className={styles.cardBadge}>
            {item.featured ? <span className={styles.cardFeatured}>Топ выбор</span> : <span />}
            <span
              className={`${styles.cardStatusChip} ${
                item.isAvailable ? styles.cardStatusAvailable : styles.cardStatusSoon
              }`}
            >
              {item.isAvailable ? 'Доступно' : 'Скоро'}
            </span>
          </div>
        </motion.div>
      </button>

      <div className={styles.cardBody}>
        <div className={styles.cardBodyTop}>
          <div className={styles.cardMeta}>
            <span className={styles.cardCategory}>{item.category}</span>
            <div className={styles.cardRating}>
              <Star className={styles.starIcon} size={12} fill="currentColor" color="currentColor" />
              <strong>{item.ownerRating}</strong>
            </div>
          </div>

          <button type="button" onClick={() => onOpen(item)} className={styles.cardTitleButton}>
            {item.title}
          </button>

          <div className={styles.cardMetaStack}>
            <p className={styles.cardLocationLine}>
              <MapPin size={14} />
              <span>{locationLabel}</span>
            </p>

            <div className={styles.cardDate}>
              <span className={styles.cardMetaItem}>
                <Clock3 size={13} />
                {publishedLabel}
              </span>
              <span className={styles.cardMetaDivider} aria-hidden="true" />
              <span className={styles.cardMetaItem}>
                <Eye size={13} />
                {viewsLabel}
              </span>
            </div>
          </div>

          <div className={styles.cardHighlights}>
            <span
              className={`${styles.cardHighlightChip} ${
                item.isAvailable ? '' : styles.cardHighlightChipMuted
              }`}
            >
              <Clock3 size={12} />
              <span>{item.isAvailable ? 'Можно забрать сегодня' : item.dateAvailable}</span>
            </span>

            {highlightItems.map((highlight) => {
              const Icon = highlightVisuals[highlight as keyof typeof highlightVisuals] ?? ShieldCheck;

              return (
                <span key={highlight} className={styles.cardHighlightChip}>
                  <Icon size={12} />
                  <span>{highlight}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.cardOwnerRow}>
            <div className={styles.cardOwnerAvatar} aria-hidden="true">
              {isExternalImage(ownerAvatarValue) ? (
                <img
                  src={ownerAvatarValue}
                  alt=""
                  className={styles.cardOwnerAvatarImage}
                />
              ) : (
                <span>{ownerInitial}</span>
              )}
            </div>

            <div className={styles.cardOwnerInfo}>
              <strong>{item.ownerName}</strong>
              <span>{item.responseTime}</span>
            </div>
          </div>

          <div className={styles.cardPriceRow}>
            <div className={styles.cardPriceBlock}>
              <strong>{formatCatalogCardPrimaryPrice(item)}</strong>
              <span className={styles.cardPriceSecondary}>{secondaryPrice}</span>
            </div>

            <button type="button" className={styles.cardActionButton} onClick={() => onOpen(item)}>
              <span>Подробнее</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
