"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  ArrowLeft,
  Inbox,
  MessageSquare,
  Send,
} from "lucide-react";
import type {
  ProfileReview,
  RatingBreakdown,
  ReceivedFilter,
  ReviewSort,
  StarFilter,
} from "./types";
import { useSession } from "@/business/auth";
import {
  useCreateReview,
  useFetchReviewsByUserQuery,
  useFetchUserReviewSummaryQuery,
  type ReviewDTO,
} from "@/business/reviews";
import { showToast, useAppDispatch } from "@/business/shared";
import { pluralize, ROUTES } from "@/ux/utils";
import { RatingSummary } from "./components/RatingSummary";
import { ReviewCard } from "./components/ReviewCard";
import { useReviews } from "./hooks/useReviews";
import styles from "./ReviewsPage.module.scss";

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "highest", label: "Высокий рейтинг" },
  { value: "lowest", label: "Низкий рейтинг" },
];

const EMPTY_DISTRIBUTION: RatingBreakdown["distribution"] = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

function getReviewRole(reviewType: string): ProfileReview["myRole"] {
  return reviewType === "RENTER_TO_OWNER" ? "owner" : "renter";
}

function mapReviewDtoToProfileReview(review: ReviewDTO): ProfileReview {
  return {
    id: review.id,
    dealId: review.dealId,
    fromUserId: review.reviewerId,
    toUserId: review.reviewedUserId,
    rating: review.rating as 1 | 2 | 3 | 4 | 5,
    text: review.text,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    authorName: `Пользователь ${review.reviewerId.slice(0, 8)}`,
    authorAvatar: null,
    itemTitle: `Объявление ${review.itemId.slice(0, 8)}`,
    itemImage: null,
    myRole: getReviewRole(review.reviewType),
    reply: null,
  };
}

function buildRatingBreakdown(
  reviews: ProfileReview[],
  average: number,
  total: number,
): RatingBreakdown {
  const distribution = { ...EMPTY_DISTRIBUTION };

  reviews.forEach((review) => {
    distribution[review.rating] += 1;
  });

  return {
    average,
    total,
    distribution,
  };
}

export type ReviewsPageProps = {
  received?: ProfileReview[];
  given?: ProfileReview[];
  breakdown?: RatingBreakdown;
  isLoading?: boolean;
};

export function ReviewsPage({
  received: externalReceived,
  given: externalGiven,
  breakdown: externalBreakdown,
  isLoading: externalLoading,
}: ReviewsPageProps = {}) {
  const dispatch = useAppDispatch();
  const { user } = useSession();
  const userId = user?.id ?? "";
  const {
    data: backendReviews = [],
    isLoading: isReviewsLoading,
    isFetching: isReviewsFetching,
    refetch: refetchReviews,
  } = useFetchReviewsByUserQuery(userId, { skip: !userId });
  const {
    data: ratingSummary,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
  } = useFetchUserReviewSummaryQuery(userId, { skip: !userId });
  const { createReview, isCreating } = useCreateReview();
  const [dealId, setDealId] = useState("");
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [reviewText, setReviewText] = useState("");

  const receivedFromBackend = backendReviews.map(mapReviewDtoToProfileReview);
  const backendBreakdown = buildRatingBreakdown(
    receivedFromBackend,
    ratingSummary?.overallRating ?? 0,
    ratingSummary?.totalReviews ?? receivedFromBackend.length,
  );
  const isPageLoading =
    externalLoading ??
    (!externalReceived &&
      (isReviewsLoading || isReviewsFetching || isSummaryLoading || isSummaryFetching));

  const {
    tab,
    setTab,
    receivedFilter,
    setReceivedFilter,
    starFilter,
    setStarFilter,
    sort,
    setSort,
    receivedReviews,
    givenReviews,
    breakdown,
    reviews,
  } = useReviews({
    received: externalReceived ?? receivedFromBackend,
    given: externalGiven ?? [],
    breakdown: externalBreakdown ?? backendBreakdown,
  });

  const handleCreateReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dealId.trim()) {
      dispatch(showToast({ type: "error", message: "Укажите id сделки" }));
      return;
    }

    try {
      await createReview({
        dealId: dealId.trim(),
        rating,
        text: reviewText.trim() || undefined,
      });
      setDealId("");
      setReviewText("");
      refetchReviews();
      dispatch(showToast({ type: "success", message: "Отзыв отправлен" }));
    } catch {
      dispatch(showToast({ type: "error", message: "Не удалось отправить отзыв" }));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href={ROUTES.profile} className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Назад в профиль</span>
        </Link>

        <h1 className={styles.pageTitle}>Отзывы</h1>
        <p className={styles.pageSubtitle}>
          {isPageLoading
            ? "Загружаем отзывы с backend"
            : `${breakdown.total} ${pluralize(breakdown.total, "отзыв", "отзыва", "отзывов")} · средняя оценка ${breakdown.average.toFixed(1)}`}
        </p>

        <form className={styles.filtersBar} onSubmit={handleCreateReview}>
          <input
            className={styles.sortSelect}
            value={dealId}
            onChange={(event) => setDealId(event.target.value)}
            placeholder="ID сделки"
          />
          <select
            className={styles.sortSelect}
            value={rating}
            onChange={(event) => setRating(Number(event.target.value) as 1 | 2 | 3 | 4 | 5)}
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>{value} звезд</option>
            ))}
          </select>
          <input
            className={styles.sortSelect}
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="Текст отзыва"
          />
          <button type="submit" className={styles.filterPill} disabled={isCreating}>
            Оставить отзыв
          </button>
        </form>

        <RatingSummary breakdown={breakdown} starFilter={starFilter} onStarFilter={setStarFilter} />

        <div className={styles.tabs}>
          <button
            type="button"
            className={clsx(styles.tab, tab === "received" && styles.tabActive)}
            onClick={() => { setTab("received"); setStarFilter(0); }}
          >
            <Inbox size={16} />
            <span>Полученные</span>
            <span className={clsx(styles.tabBadge, tab !== "received" && styles.tabBadgeInactive)}>
              {receivedReviews.length}
            </span>
          </button>
          <button
            type="button"
            className={clsx(styles.tab, tab === "given" && styles.tabActive)}
            onClick={() => { setTab("given"); setReceivedFilter("all"); setStarFilter(0); }}
          >
            <Send size={16} />
            <span>Оставленные</span>
            <span className={clsx(styles.tabBadge, tab !== "given" && styles.tabBadgeInactive)}>
              {givenReviews.length}
            </span>
          </button>
        </div>

        <div className={styles.filtersBar}>
          <div className={styles.filterPills}>
            {([0, 5, 4, 3, 2, 1] as StarFilter[]).map((s) => (
              <button
                key={`star-${s}`}
                type="button"
                className={clsx(styles.filterPill, starFilter === s && styles.filterPillActive)}
                onClick={() => setStarFilter(s)}
              >
                {s === 0 ? "Все оценки" : `${"★".repeat(s)} ${s}`}
              </button>
            ))}
          </div>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={(event) => setSort(event.target.value as ReviewSort)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {tab === "received" ? (
          <div className={styles.filtersBar}>
            {(["all", "as_owner", "as_renter"] as ReceivedFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                className={clsx(styles.filterPill, receivedFilter === filter && styles.filterPillActive)}
                onClick={() => setReceivedFilter(filter)}
              >
                {filter === "all" ? "Все" : filter === "as_owner" ? "Как владелец" : "Как арендатор"}
              </button>
            ))}
          </div>
        ) : null}

        {isPageLoading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><MessageSquare /></div>
            <h3 className={styles.emptyTitle}>Загружаем отзывы</h3>
            <p className={styles.emptyText}>Получаем данные из backend</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><MessageSquare /></div>
            <h3 className={styles.emptyTitle}>Отзывов пока нет</h3>
            <p className={styles.emptyText}>
              {tab === "received"
                ? "Здесь появятся отзывы, когда другие пользователи оценят вас"
                : "Backend сейчас не отдает отдельный список оставленных отзывов"}
            </p>
          </div>
        ) : (
          <div className={styles.reviewsList}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} isGiven={tab === "given"} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
