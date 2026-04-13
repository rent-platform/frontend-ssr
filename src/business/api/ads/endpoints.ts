import { baseApi } from "@/business/api/baseApi";
import {
  AdsListResponseDto,
  AdsItemResponseDto,
  AdsCreateAd,
  UpdatePlaylistArgs,
  FetchAdsArgs,
} from "@/business/types/dto/ads.dto";
import { PhotosList } from "@/business/types/entity/catalog.types";

export const adsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchAds: build.infiniteQuery<
      AdsListResponseDto,
      FetchAdsArgs,
      string | undefined
    >({
      infiniteQueryOptions: {
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => {
          return lastPage.meta.nextCursor || undefined;
        },
      },
      query: ({ pageParam, queryArg }) => ({
        url: `ads`,
        params: {
          cursor: pageParam,
          pageSize: queryArg.pageSize ?? 40,
          ...(queryArg.search && { search: queryArg.search }),
          ...(queryArg.sortBy && { sortBy: queryArg.sortBy }),
          ...(queryArg.sortDirection && {
            sortDirection: queryArg.sortDirection,
          }),
        },
      }),
      providesTags: ["Ads"],
      keepUnusedDataFor: 300,
    }),

    fetchAd: build.query<AdsItemResponseDto, string>({
      query: (id) => ({ url: `ads/${id}` }), // TODO: ads на "/" ?
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
    uploadAdPhotos: build.mutation<PhotosList, { adId: string; files: File[] }>(
      {
        query: ({ adId, files }) => {
          const formData = new FormData();
          files.forEach((file) => formData.append("photos", file));

          return {
            url: `ads/${adId}/photos`,
            method: "POST",
            body: formData,
          };
        },
        invalidatesTags: (_result, _error, { adId }) => [
          { type: "AdsItem", id: adId },
        ],
      },
    ),
  }),
});

export const {
  useFetchAdQuery,
  useFetchAdsInfiniteQuery,
  useCreateAdMutation,
  useDeleteAdMutation,
  useUpdateAdMutation,
  useUploadAdPhotosMutation,
} = adsApi;
