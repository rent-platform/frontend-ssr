export interface ReviewDTO {
  id: string;
  dealId: string;
  itemId: string;
  reviewerId: string;
  reviewedUserId: string;
  reviewType: string;
  rating: number;
  text: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  dealId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text?: string;
}

export interface ReviewsPageResponseDto {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: ReviewDTO[];
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface UserRatingSummaryDTO {
  overallRating: number;
  totalReviews: number;
  ownerRating: number;
  ownerReviews: number;
  renterRating: number;
  renterReviews: number;
}

export interface ItemRatingSummaryDTO {
  averageRating: number;
  totalReviews: number;
}
