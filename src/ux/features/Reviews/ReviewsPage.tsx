'use client';

import Link from 'next/link';
import clsx from 'clsx';
import {
  ArrowLeft,
  Inbox,
  MessageSquare,
  Send,
  Star,
} from 'lucide-react';
import type {
  ReceivedFilter,
  ReviewSort,
  StarFilter,
  ProfileReview,
  RatingBreakdown,
} from './types';
import {
  MOCK_REVIEWS_RECEIVED,
  MOCK_REVIEWS_GIVEN,
} from './mockReviewsData';
import { pluralize, ROUTES } from '@/ux/utils';
import { RatingSummary } from './components/RatingSummary';
import { ReviewCard } from './components/ReviewCard';
import { useReviews } from './hooks/useReviews';
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
  const {
    tab,
    setTab,
    receivedFilter,
    setReceivedFilter,
    starFilter,
    setStarFilter,
    sort,
    setSort,
    breakdown,
    reviews,
  } = useReviews({
    received: externalReceived,
    given: externalGiven,
    breakdown: externalBreakdown,
  });

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
            className={clsx(styles.tab, tab === 'received' && styles.tabActive)}
            onClick={() => { setTab('received'); setStarFilter(0); }}
          >
            <Inbox size={16} />
            <span>Полученные</span>
            <span className={clsx(styles.tabBadge, tab !== 'received' && styles.tabBadgeInactive)}>
              {MOCK_REVIEWS_RECEIVED.length}
            </span>
          </button>
          <button
            type="button"
            className={clsx(styles.tab, tab === 'given' && styles.tabActive)}
            onClick={() => { setTab('given'); setReceivedFilter('all'); setStarFilter(0); }}
          >
            <Send size={16} />
            <span>Оставленные</span>
            <span className={clsx(styles.tabBadge, tab !== 'given' && styles.tabBadgeInactive)}>
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
                className={clsx(styles.filterPill, starFilter === s && styles.filterPillActive)}
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
