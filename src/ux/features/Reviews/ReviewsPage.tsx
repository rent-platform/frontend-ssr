'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Camera,
  Inbox,
  MessageSquare,
  Package,
  Pencil,
  Send,
  Star,
} from 'lucide-react';
import type {
  ReviewsTab,
  ReceivedFilter,
  ReviewSort,
  StarFilter,
  ProfileReview,
  RatingBreakdown,
} from './types';
import {
  MOCK_REVIEWS_RECEIVED,
  MOCK_REVIEWS_GIVEN,
  MOCK_RATING_BREAKDOWN,
} from './mockReviewsData';
import { pluralize, getInitials, formatDate, ROUTES } from '@/ux/utils';
import styles from './ReviewsPage.module.scss';


const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'highest', label: 'Высокий рейтинг' },
  { value: 'lowest', label: 'Низкий рейтинг' },
];

const RECEIVED_FILTERS: { value: ReceivedFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'as_owner', label: 'Как арендодатель' },
  { value: 'as_renter', label: 'Как арендатор' },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   ReviewsPage
   ═══════════════════════════════════════════════════════════════════════════════ */

export type ReviewsPageProps = {
  /** Reviews received from API. Falls back to mock. */
  received?: ProfileReview[];
  /** Reviews given from API. Falls back to mock. */
  given?: ProfileReview[];
  /** Rating breakdown from API. Falls back to mock. */
  breakdown?: RatingBreakdown;
  /** True while loading from API. */
  isLoading?: boolean;
};

export function ReviewsPage({
  received: externalReceived,
  given: externalGiven,
  breakdown: externalBreakdown,
  isLoading: _externalLoading,
}: ReviewsPageProps = {}) {
  const [tab, setTab] = useState<ReviewsTab>('received');
  const [receivedFilter, setReceivedFilter] = useState<ReceivedFilter>('all');
  const [starFilter, setStarFilter] = useState<StarFilter>(0);
  const [sort, setSort] = useState<ReviewSort>('newest');

  const receivedReviews = externalReceived ?? MOCK_REVIEWS_RECEIVED;
  const givenReviews = externalGiven ?? MOCK_REVIEWS_GIVEN;
  const breakdown = externalBreakdown ?? MOCK_RATING_BREAKDOWN;

  const reviews = useMemo(() => {
    const source = tab === 'received' ? receivedReviews : givenReviews;

    let filtered = source;

    if (tab === 'received' && receivedFilter !== 'all') {
      const role = receivedFilter === 'as_owner' ? 'owner' : 'renter';
      filtered = filtered.filter((r) => r.myRole === role);
    }

    if (starFilter > 0) {
      filtered = filtered.filter((r) => r.rating === starFilter);
    }

    const sorted = [...filtered];
    switch (sort) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
    }

    return sorted;
  }, [tab, receivedFilter, starFilter, sort]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href={ROUTES.profile} className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Назад в профиль</span>
        </Link>

        <h1 className={styles.pageTitle}>Отзывы</h1>
        <p className={styles.pageSubtitle}>
          {breakdown.total} {pluralize(breakdown.total, 'отзыв', 'отзыва', 'отзывов')} · средняя оценка {breakdown.average.toFixed(1)}
        </p>

        {/* ── Rating Summary ── */}
        <RatingSummary breakdown={breakdown} starFilter={starFilter} onStarFilter={setStarFilter} />

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'received' ? styles.tabActive : ''}`}
            onClick={() => { setTab('received'); setStarFilter(0); }}
          >
            <Inbox size={16} />
            <span>Полученные</span>
            <span className={`${styles.tabBadge} ${tab !== 'received' ? styles.tabBadgeInactive : ''}`}>
              {MOCK_REVIEWS_RECEIVED.length}
            </span>
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'given' ? styles.tabActive : ''}`}
            onClick={() => { setTab('given'); setReceivedFilter('all'); setStarFilter(0); }}
          >
            <Send size={16} />
            <span>Оставленные</span>
            <span className={`${styles.tabBadge} ${tab !== 'given' ? styles.tabBadgeInactive : ''}`}>
              {MOCK_REVIEWS_GIVEN.length}
            </span>
          </button>
        </div>

        {/* ── Filters ── */}
        <div className={styles.filtersBar}>
          <div className={styles.filterPills}>
            {([0, 5, 4, 3, 2, 1] as StarFilter[]).map((s) => (
              <button
                key={`star-${s}`}
                type="button"
                className={`${styles.filterPill} ${starFilter === s ? styles.filterPillActive : ''}`}
                onClick={() => setStarFilter(s)}
              >
                {s === 0 ? 'Все оценки' : `${'★'.repeat(s)} ${s}`}
              </button>
            ))}
          </div>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value as ReviewSort)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* ── Reviews List ── */}
        {reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><MessageSquare /></div>
            <h3 className={styles.emptyTitle}>Отзывов пока нет</h3>
            <p className={styles.emptyText}>
              {tab === 'received'
                ? 'Здесь появятся отзывы, когда другие пользователи оценят вас'
                : 'Вы пока не оставляли отзывов'}
            </p>
          </div>
        ) : (
          <div className={styles.reviewsList}>
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} isGiven={tab === 'given'} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ Rating Summary ═══ */
function RatingSummary({
  breakdown,
  starFilter,
  onStarFilter,
}: {
  breakdown: RatingBreakdown;
  starFilter: StarFilter;
  onStarFilter: (s: StarFilter) => void;
}) {
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
              fill={i <= Math.round(breakdown.average) ? '#f59e0b' : 'none'}
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
              className={styles.barRow}
              style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0, opacity: starFilter > 0 && !isActive ? 0.4 : 1 }}
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

/* ═══ Review Card ═══ */
function ReviewCard({ review, isGiven }: { review: ProfileReview; isGiven: boolean }) {
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
              <span className={`${styles.reviewRoleBadge} ${roleCls}`}>
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
                  fill={i <= review.rating ? '#f59e0b' : 'none'}
                  className={i <= review.rating ? styles.starFilled : styles.starEmpty}
                />
              ))}
            </div>
            <span className={styles.reviewDate}>{formatDate(review.created_at, 'long')}</span>
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
            <span className={styles.replyDate}>{formatDate(review.reply.created_at, 'long')}</span>
          </div>
          <p className={styles.replyText}>{review.reply.text}</p>
        </div>
      )}
    </div>
  );
}
