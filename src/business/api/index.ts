export {
  adsApi,
  useFetchAdByIdQuery,
  useFetchAdsInfiniteQuery,
  useCreateAdMutation,
  useDeleteAdMutation,
  useUpdateAdMutation,
  useUploadAdPhotosMutation,
} from "./ads/endpoints";

export {
  dealsApi,
  useFetchDealsQuery,
  useCreateDealRequestMutation,
  useFetchDealByIdQuery,
  useConfirmDealMutation,
  useRejectDealMutation,
  useCancelDealMutation,
  useStartDealMutation,
  useCompleteDealMutation,
  useFetchMyIncomingDealsQuery,
  useFetchMyOutgoingDealsQuery,
  useFetchDealStatusHistoryQuery,
} from "./deals/endpoints";

export {
  reviewsApi,
  useCreateReviewMutation,
  useFetchReviewsByUserQuery,
  useFetchReviewsByAdQuery,
  useFetchUserRatingQuery,
} from "./reviews/endpoints";

export {
  endpoints as paymentsApi,
  useCreatePaymentMutation,
  useCapturePaymentMutation,
  useCancelPaymentMutation,
  useFetchPaymentByDealQuery,
  useFetchPaymentByIdQuery,
} from "./payments/endpoints";

export {
  profileApi,
  useGetProfileQuery,
  useUploadAvatarMutation,
  useUpdateUserInfoMutation,
} from "./profile/endpoints";
