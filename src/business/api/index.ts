export {
  useFetchAdByIdQuery,
  useFetchAdsInfiniteQuery,
  useCreateAdMutation,
  useDeleteAdMutation,
  useUpdateAdMutation,
  useUploadAdPhotosMutation,
} from "./ads/endpoints";

export {
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
  useCreateReviewMutation,
  useFetchReviewsByUserQuery,
  useFetchReviewsByAdQuery,
  useFetchUserRatingQuery,
} from "./reviews/endpoints";

export {
  useGetProfileQuery,
  useUploadAvatarMutation,
  useUpdateUserInfoMutation,
} from "./profile/endpoints";
