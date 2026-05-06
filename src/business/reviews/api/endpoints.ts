import { baseApi } from "@/business/shared";
import type {
  CreateReviewRequest,
  ItemRatingSummaryDTO,
  ReviewDTO,
  ReviewsPageResponseDto,
  UserRatingSummaryDTO,
} from "../types";

const DEALS_URL = "api/deals";
const REVIEWS_URL = "api/reviews";
const REVIEWS_BY_USER_TAG_ID = "BY_USER";
const REVIEWS_BY_AD_TAG_ID = "BY_AD";
const REVIEWS_BY_DEAL_TAG_ID = "BY_DEAL";
const REVIEW_SUMMARY_TAG_ID = "SUMMARY";

const getReviewTags = (reviews?: ReviewDTO[]) =>
  reviews?.map((review) => ({ type: "Review" as const, id: review.id })) ?? [];

const getPageParams = () => ({
  page: "0",
  size: "20",
});

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createReview: build.mutation<ReviewDTO, CreateReviewRequest>({
      query: ({ dealId, ...body }) => ({
        url: `${DEALS_URL}/${dealId}/review`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => [
        { type: "Review", id: REVIEWS_BY_USER_TAG_ID },
        { type: "Review", id: REVIEWS_BY_AD_TAG_ID },
        { type: "Review", id: REVIEWS_BY_DEAL_TAG_ID },
        ...(result ? [{ type: "Review" as const, id: result.id }] : []),
      ],
    }),

    fetchReviewsByUser: build.query<ReviewDTO[], string>({
      query: (userId) => ({
        url: `${REVIEWS_URL}/users/${userId}`,
        params: getPageParams(),
      }),
      transformResponse: (response: ReviewsPageResponseDto) =>
        response.content ?? [],
      providesTags: (result, _error, userId) => [
        { type: "Review", id: REVIEWS_BY_USER_TAG_ID },
        { type: "Review", id: `USER-${userId}` },
        ...getReviewTags(result),
      ],
    }),

    fetchReviewsByAd: build.query<ReviewDTO[], string>({
      query: (adId) => ({
        url: `${REVIEWS_URL}/items/${adId}`,
        params: getPageParams(),
      }),
      transformResponse: (response: ReviewsPageResponseDto) =>
        response.content ?? [],
      providesTags: (result, _error, adId) => [
        { type: "Review", id: REVIEWS_BY_AD_TAG_ID },
        { type: "Review", id: `AD-${adId}` },
        ...getReviewTags(result),
      ],
    }),

    fetchReviewsByDeal: build.query<ReviewDTO[], string>({
      query: (dealId) => ({
        url: `${DEALS_URL}/${dealId}/reviews`,
      }),
      providesTags: (result, _error, dealId) => [
        { type: "Review", id: REVIEWS_BY_DEAL_TAG_ID },
        { type: "Review", id: `DEAL-${dealId}` },
        ...getReviewTags(result),
      ],
    }),

    fetchUserReviewSummary: build.query<UserRatingSummaryDTO, string>({
      query: (userId) => ({
        url: `${REVIEWS_URL}/users/${userId}/summary`,
      }),
      providesTags: (_result, _error, userId) => [
        { type: "Review", id: REVIEW_SUMMARY_TAG_ID },
        { type: "Review", id: `USER-SUMMARY-${userId}` },
      ],
    }),

    fetchItemReviewSummary: build.query<ItemRatingSummaryDTO, string>({
      query: (itemId) => ({
        url: `${REVIEWS_URL}/items/${itemId}/summary`,
      }),
      providesTags: (_result, _error, itemId) => [
        { type: "Review", id: REVIEW_SUMMARY_TAG_ID },
        { type: "Review", id: `ITEM-SUMMARY-${itemId}` },
      ],
    }),
  }),
});

export const {
  useCreateReviewMutation,
  useFetchReviewsByUserQuery,
  useFetchReviewsByAdQuery,
  useFetchReviewsByDealQuery,
  useFetchUserReviewSummaryQuery,
  useFetchItemReviewSummaryQuery,
} = reviewsApi;
