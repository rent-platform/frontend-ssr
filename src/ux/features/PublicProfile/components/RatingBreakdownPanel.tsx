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
          {Array.from({ length: 5 }).map((_, i) => {
            const full = Math.floor(rating);
            const fraction = rating - full;
            const isFull = i < full;
            const isPartial = i === full && fraction > 0;

            return (
              <span key={i} className={styles.starWrap} style={isPartial ? { clipPath: `inset(0 ${((1 - fraction) * 100).toFixed(0)}% 0 0)` } : undefined}>
                <Star size={16} fill={isFull || isPartial ? 'currentColor' : 'none'} className={isFull || isPartial ? styles.starFilled : styles.starEmpty} />
              </span>
            );
          })}
        </div>
        <span className={styles.ratingBigCount}>
          {reviewCount} {pluralize(reviewCount, 'отзыв', 'отзыва', 'отзывов')}
        </span>
      </div>
      <div className={styles.ratingBars}>
        {RATING_DISTRIBUTION.map((row) => (
          <div key={row.stars} className={styles.ratingBarRow}>
            <span className={styles.ratingBarLabel}>{row.stars}</span>
            <Star size={11} fill="currentColor" className={styles.starFilled} />
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
