export interface ReviewDTO {
  id: string;
  dealId: string;
  adId?: string;
  userId?: string;
  authorId?: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  dealId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
}

export interface UserRating {
  averageRating: number;
  totalReviews: number;
}
