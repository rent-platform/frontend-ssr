'use client';

import { Package, Pencil, Star } from 'lucide-react';
import clsx from 'clsx';
import type { ProfileReview } from '../types';
import { getInitials, formatDate } from '@/ux/utils';
import styles from '../ReviewsPage.module.scss';

type ReviewCardProps = {
  review: ProfileReview;
  isGiven: boolean;
};

export function ReviewCard({ review, isGiven }: ReviewCardProps) {
  const roleLabel = review.myRole === 'owner' ? 'Арендодатель' : 'Арендатор';
  const roleCls = review.myRole === 'owner' ? styles.roleBadgeOwner : styles.roleBadgeRenter;

  return (
    <div className={styles.reviewCard}>
      {/* Header */}
      <div className={styles.reviewHeader}>
        {review.authorAvatar ? (
          <img src={review.authorAvatar} alt={review.authorName} className={styles.reviewAvatarImg} />
        ) : (
          <div className={styles.reviewAvatar}>{getInitials(review.authorName)}</div>
        )}
        <div className={styles.reviewMeta}>
          <div className={styles.reviewAuthorRow}>
            <span className={styles.reviewAuthor}>{review.authorName}</span>
            {!isGiven && (
              <span className={clsx(styles.reviewRoleBadge, roleCls)}>
                вы — {roleLabel.toLowerCase()}
              </span>
            )}
          </div>
          <div className={styles.reviewStarsRow}>
            <div className={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i <= review.rating ? 'var(--color-warning)' : 'none'}
                  className={i <= review.rating ? styles.starFilled : styles.starEmpty}
                />
              ))}
            </div>
            <span className={styles.reviewDate}>{formatDate(review.createdAt, 'long')}</span>
          </div>
        </div>
      </div>

      {/* Text */}
      {review.text && <p className={styles.reviewText}>{review.text}</p>}

      {/* Item reference */}
      <div className={styles.reviewItem}>
        {review.itemImage ? (
          <img src={review.itemImage} alt={review.itemTitle} className={styles.reviewItemImage} />
        ) : (
          <div className={styles.reviewItemPlaceholder}><Package size={18} /></div>
        )}
        <span className={styles.reviewItemTitle}>{review.itemTitle}</span>
      </div>

      {/* Reply */}
      {review.reply && (
        <div className={styles.reviewReply}>
          <div className={styles.replyHeader}>
            <Pencil size={12} />
            <span className={styles.replyLabel}>Ваш ответ</span>
            <span className={styles.replyDate}>{formatDate(review.reply.createdAt, 'long')}</span>
          </div>
          <p className={styles.replyText}>{review.reply.text}</p>
        </div>
      )}
    </div>
  );
}
