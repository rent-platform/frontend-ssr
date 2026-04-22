import type { Review } from '@/business/types/entity';

/* ═══ Tabs ═══ */

export type ReviewsTab = 'received' | 'given';

/* ═══ Sub-filter for received reviews ═══ */

export type ReceivedFilter = 'all' | 'as_owner' | 'as_renter';

/* ═══ Sort options ═══ */

export type ReviewSort = 'newest' | 'oldest' | 'highest' | 'lowest';

/* ═══ Star rating filter ═══ */

export type StarFilter = 0 | 1 | 2 | 3 | 4 | 5; // 0 = all

/* ═══ Rating breakdown ═══ */

export type RatingBreakdown = {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

/* ═══ Profile review (enriched for UI) ═══ */

export type ProfileReview = Review & {
  authorName: string;
  authorAvatar: string | null;
  itemTitle: string;
  itemImage: string | null;
  /** Which role the current user had in this deal */
  myRole: 'owner' | 'renter';
  /** Optional owner reply */
  reply: {
    text: string;
    created_at: string;
  } | null;
};
