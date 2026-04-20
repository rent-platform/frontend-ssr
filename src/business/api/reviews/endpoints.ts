import { baseApi } from "@/business/api/baseApi";
import type {
  CreateReviewRequest,
  Review,
  UserRating,
} from "@/business/types/dto/reviews.dto";

const REVIEWS_BY_USER_TAG_ID = "BY_USER";
const REVIEWS_BY_AD_TAG_ID = "BY_AD";
const USER_RATING_TAG_ID = "LIST";

const getReviewTags = (reviews?: Review[]) =>
  reviews?.map((review) => ({ type: "Review" as const, id: review.id })) ?? [];

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createReview: build.mutation<Review, CreateReviewRequest>({
      query: (body) => ({
        url: "reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => [
        { type: "Review", id: REVIEWS_BY_USER_TAG_ID },
        { type: "Review", id: REVIEWS_BY_AD_TAG_ID },
        { type: "UserRating", id: USER_RATING_TAG_ID },
        ...(result?.userId ? [{ type: "UserRating" as const, id: result.userId }] : []),
        ...(result ? [{ type: "Review" as const, id: result.id }] : []),
      ],
    }),

    fetchReviewsByUser: build.query<Review[], string>({
      query: (userId) => ({
        url: "reviews",
        params: { userId },
      }),
      providesTags: (result, _error, userId) => [
        { type: "Review", id: REVIEWS_BY_USER_TAG_ID },
        { type: "Review", id: `USER-${userId}` },
        ...getReviewTags(result),
      ],
    }),

    fetchReviewsByAd: build.query<Review[], string>({
      query: (adId) => ({
        url: "reviews",
        params: { adId },
      }),
      providesTags: (result, _error, adId) => [
        { type: "Review", id: REVIEWS_BY_AD_TAG_ID },
        { type: "Review", id: `AD-${adId}` },
        ...getReviewTags(result),
      ],
    }),

    fetchUserRating: build.query<UserRating, string>({
      query: (userId) => ({
        url: `users/${userId}/rating`,
      }),
      providesTags: (_result, _error, userId) => [
        { type: "UserRating", id: USER_RATING_TAG_ID },
        { type: "UserRating", id: userId },
      ],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useFetchReviewsByUserQuery,
  useFetchReviewsByAdQuery,
  useFetchUserRatingQuery,
} = reviewsApi;
