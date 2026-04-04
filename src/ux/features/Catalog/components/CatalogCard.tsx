import type { CatalogUiItem } from '../types';
import {
  formatRelativeDate,
  formatViews,
  getPrimaryPrice,
  getSecondaryPrice,
} from '../utils';
import styles from '../Catalog.module.scss';

type CatalogCardProps = {
  item: CatalogUiItem;
  pricingMode: 'day' | 'hour';
  onOpen: (item: CatalogUiItem) => void;
};

export function CatalogCard({ item, pricingMode, onOpen }: CatalogCardProps) {
  return (
    <article className={styles.card}>
      <button type="button" className={styles.cardFavorite} aria-label="Добавить в избранное">
        ♡
      </button>

      <button type="button" className={styles.cardImageButton} onClick={() => onOpen(item)}>
        <div className={styles.cardImageWrap}>
          <img src={item.imageUrl ?? item.images[0]} alt={item.title} className={styles.cardImage} />
          {item.featured ? <span className={styles.cardFeatured}>Топ аренда</span> : null}
          <span className={styles.cardAvailability}>{item.dateAvailable}</span>
        </div>
      </button>

      <div className={styles.cardBody}>
        <div className={styles.cardPriceBlock}>
          <strong>{getPrimaryPrice(item, pricingMode)}</strong>
          <span>{getSecondaryPrice(item)}</span>
        </div>

        <button type="button" onClick={() => onOpen(item)} className={styles.cardTitleButton}>
          {item.title}
        </button>

        <p className={styles.cardDescription}>{item.item_description}</p>

        <div className={styles.cardTags}>
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <div className={styles.cardMeta}>
          <span>{item.city}</span>
          <span>{formatViews(item.views_count)}</span>
          <span>{formatRelativeDate(item.created_at)}</span>
        </div>

        <div className={styles.cardOwner}>
          <div className={styles.ownerAvatar}>{item.ownerAvatar}</div>
          <div>
            <strong>{item.ownerName}</strong>
            <p>
              ★ {item.ownerRating} · {item.responseTime}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
