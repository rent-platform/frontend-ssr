'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Star, ThumbsUp } from 'lucide-react';
import clsx from 'clsx';
import { getInitials, EASE } from '@/ux/utils';
import { formatDate } from '@/ux/utils';
import type { PublicReview } from '../types';
import styles from '../PublicProfile.module.scss';

export type PublicReviewCardProps = {
  review: PublicReview;
  index: number;
  isHelpful: boolean;
  onToggleHelpful: (id: string) => void;
};

export function PublicReviewCard({ review, index, isHelpful, onToggleHelpful }: PublicReviewCardProps) {
  const authorInitials = getInitials(review.authorName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: EASE }}
    >
      <div className={styles.reviewCard}>
        <div className={styles.reviewHeader}>
          <div className={styles.reviewAvatar}>{authorInitials}</div>
          <div className={styles.reviewMeta}>
            <strong>{review.authorName}</strong>
            <span className={styles.reviewItemTag}>
              <ExternalLink size={11} />
              {review.itemTitle}
            </span>
          </div>
          <div className={styles.reviewRight}>
            <div className={styles.reviewStars}>
              {Array.from({ length: 5 }).map((_, si) => (
                <Star key={si} size={12} className={si < review.rating ? styles.starFilled : styles.starEmpty} />
              ))}
            </div>
            <span className={styles.reviewDate}>{formatDate(review.date)}</span>
          </div>
        </div>
        <p className={styles.reviewText}>{review.text}</p>
        <div className={styles.reviewActions}>
          <button
            type="button"
            className={clsx(styles.helpfulBtn, isHelpful && styles.helpfulBtnActive)}
            onClick={() => onToggleHelpful(review.id)}
          >
            <ThumbsUp size={13} />
            {isHelpful ? 'Полезно' : 'Полезный отзыв'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
