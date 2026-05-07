'use client';

import { Star } from 'lucide-react';
import clsx from 'clsx';
import type { RatingBreakdown, StarFilter } from '../types';
import { pluralize } from '@/ux/utils';
import styles from '../ReviewsPage.module.scss';

type RatingSummaryProps = {
  breakdown: RatingBreakdown;
  starFilter: StarFilter;
  onStarFilter: (s: StarFilter) => void;
};

export function RatingSummary({ breakdown, starFilter, onStarFilter }: RatingSummaryProps) {
  const maxCount = Math.max(...Object.values(breakdown.distribution), 1);

  return (
    <div className={styles.summaryCard}>
      <div className={styles.summaryLeft}>
        <span className={styles.summaryAverage}>{breakdown.average.toFixed(1)}</span>
        <div className={styles.summaryStars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={18}
              fill={i <= Math.round(breakdown.average) ? 'var(--color-warning)' : 'none'}
              className={i <= Math.round(breakdown.average) ? styles.starFilled : styles.starEmpty}
            />
          ))}
        </div>
        <span className={styles.summaryTotal}>
          {breakdown.total} {pluralize(breakdown.total, 'отзыв', 'отзыва', 'отзывов')}
        </span>
      </div>

      <div className={styles.summaryRight}>
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const count = breakdown.distribution[star];
          const pct = breakdown.total > 0 ? (count / maxCount) * 100 : 0;
          const isActive = starFilter === star;

          return (
            <button
              key={star}
              type="button"
              className={clsx(styles.barRow, starFilter > 0 && !isActive && styles.barRowDimmed)}
              onClick={() => onStarFilter(isActive ? 0 : star)}
            >
              <span className={styles.barLabel}>{star}</span>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: `${pct}%` }} />
              </div>
              <span className={styles.barCount}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
