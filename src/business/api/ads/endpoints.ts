import { baseApi } from "@/business/api/baseApi";
import {
  AdsListResponseDto,
  AdsQueryParams,
  AdsItemResponseDto,
  AdsCreateAd,
  UpdatePlaylistArgs,
} from "@/business/types/dto/ads.dto";

export const adsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchAds: build.query<AdsListResponseDto, AdsQueryParams>({
      query: ({ page = 1, limit = 10, category_id, search } = {}) => ({
        url: "/ads",
        params: {
          page,
          limit,
          ...(category_id !== undefined && { category_id }),
          ...(search !== undefined && { search }),
        }, // TODO: пагинацию на infinite query
      }),
      providesTags: ["Ads"],
    }),

    fetchAd: build.query<AdsItemResponseDto, string>({
      query: (id) => ({ url: `/ads/${id}` }), // TODO: ads на "/" ?
      providesTags: (_result, _err, id) => [{ type: "AdsItem", id }],
    }),
    createAd: build.mutation<AdsItemResponseDto, AdsCreateAd>({
      query: ({ ...body }) => ({
        url: "ads",
        method: "POST",
        body: {
          data: {
            type: "ads",
            attributes: {
              ...body,
            },
          },
        },
      }),
      invalidatesTags: ["Ads"],
    }),
    deleteAd: build.mutation<void, string>({
      query: (adId) => ({
        url: `ads/${adId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, adId) => [
        { type: "Ads", id: adId },
        "Ads",
      ],
    }),
    updateAd: build.mutation<
      void,
      { adId: string; payload: UpdatePlaylistArgs }
    >({
      query: ({ adId, payload }) => ({
        url: `ads/${adId}`,
        method: "PUT", // или PATCH
        body: {
          data: {
            type: "ads",
            attributes: {
              ...payload,
            },
          },
        },
      }),
      invalidatesTags: (_result, _error, { adId }) => [
        { type: "Ads", id: adId },
        "Ads",
      ],
    }),
  }),
});

export const {
  useFetchAdQuery,
  useFetchAdsQuery,
  useCreateAdMutation,
  useDeleteAdMutation,
  useUpdateAdMutation,
} = adsApi;
