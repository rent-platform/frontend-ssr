import { Star } from 'lucide-react';
import { pluralize } from '@/ux/utils';
import { RATING_DISTRIBUTION } from '../publicProfileHelpers';
import styles from '../PublicProfile.module.scss';

export type RatingBreakdownPanelProps = {
  rating: number;
  reviewCount: number;
  maxDistCount: number;
};

export function RatingBreakdownPanel({ rating, reviewCount, maxDistCount }: RatingBreakdownPanelProps) {
  return (
    <div className={styles.ratingBreakdown}>
      <div className={styles.ratingBig}>
        <span className={styles.ratingBigValue}>{rating.toFixed(1)}</span>
        <div className={styles.ratingBigStars}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} className={i < Math.round(rating) ? styles.starFilled : styles.starEmpty} />
          ))}
        </div>
        <span className={styles.ratingBigCount}>
          {reviewCount} {pluralize(reviewCount, 'отзыв', 'отзыва', 'отзывов')}
        </span>
      </div>
      <div className={styles.ratingBars}>
        {RATING_DISTRIBUTION.map((row) => (
          <div key={row.stars} className={styles.ratingBarRow}>
            <span className={styles.ratingBarLabel}>{row.stars}</span>
            <Star size={11} className={styles.starFilled} />
            <div className={styles.ratingBarTrack}>
              <div
                className={styles.ratingBarFill}
                style={{ width: maxDistCount > 0 ? `${(row.count / maxDistCount) * 100}%` : '0%' }}
              />
            </div>
            <span className={styles.ratingBarCount}>{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
