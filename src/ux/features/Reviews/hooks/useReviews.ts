import { useMemo, useState } from 'react';
import type {
  ReviewsTab,
  ReceivedFilter,
  ReviewSort,
  StarFilter,
  ProfileReview,
  RatingBreakdown,
} from '../types';
import {
  MOCK_REVIEWS_RECEIVED,
  MOCK_REVIEWS_GIVEN,
  MOCK_RATING_BREAKDOWN,
} from '../mockReviewsData';

export type UseReviewsOptions = {
  received?: ProfileReview[];
  given?: ProfileReview[];
  breakdown?: RatingBreakdown;
};

export function useReviews({
  received: externalReceived,
  given: externalGiven,
  breakdown: externalBreakdown,
}: UseReviewsOptions = {}) {
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
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
    }

    return sorted;
  }, [tab, receivedReviews, givenReviews, receivedFilter, starFilter, sort]);

  return {
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
  };
}
