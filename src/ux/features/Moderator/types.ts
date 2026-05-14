import type { AdsItemResponseDto, ItemStatus } from '@/business/ads';
import type { ReviewDTO } from '@/business/reviews';
import type { UserResponseDTO } from '@/business/auth';

/* ── Moderation queue ────────────────────────────────────────────────────── */

export type ModerationAction = 'approve' | 'reject';

export type ModerationQueueItem = AdsItemResponseDto & {
  ownerName: string;
  ownerPhone: string;
  submittedAt: string;
  photosCount: number;
};

export type ModerationQueueFilter = {
  search: string;
  sortBy: 'newest' | 'oldest';
};

/* ── Complaints ──────────────────────────────────────────────────────────── */

export type ComplaintTarget = 'item' | 'user' | 'review';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';
export type ComplaintStatus = 'new' | 'in_review' | 'resolved' | 'dismissed';

export type Complaint = {
  id: string;
  target: ComplaintTarget;
  targetId: string;
  targetTitle: string;
  reason: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  reporterId: string;
  reporterName: string;
  createdAt: string;
  resolvedAt?: string;
  moderatorComment?: string;
};

export type ComplaintsFilter = {
  search: string;
  status: ComplaintStatus | 'all';
  priority: ComplaintPriority | 'all';
  target: ComplaintTarget | 'all';
};

/* ── Reviews moderation ──────────────────────────────────────────────────── */

export type ModeratedReview = ReviewDTO & {
  reviewerName: string;
  reviewedUserName: string;
  itemTitle: string;
  isFlagged: boolean;
  flagReason?: string;
};

export type ReviewsModerationFilter = {
  search: string;
  flagged: 'all' | 'flagged' | 'clean';
  minRating: number;
  maxRating: number;
};

/* ── Complaint comment (timeline) ──────────────────────────────────────── */

export type ComplaintComment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

/* ── Activity log ──────────────────────────────────────────────────────── */

export type ModeratorActionType =
  | 'listing_approve'
  | 'listing_reject'
  | 'complaint_resolve'
  | 'complaint_dismiss'
  | 'review_delete'
  | 'review_clear_flag';

export type ModeratorActivityEntry = {
  id: string;
  action: ModeratorActionType;
  actionLabel: string;
  targetType: 'listing' | 'complaint' | 'review';
  targetId: string;
  targetTitle: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  details?: string;
};

export type ModeratorActivityFilter = {
  search: string;
  action: ModeratorActionType | 'all';
  dateFrom: string;
  dateTo: string;
};

/* ── Moderator tabs ──────────────────────────────────────────────────────── */

export type ModeratorTab = 'queue' | 'complaints' | 'reviews' | 'activity';
