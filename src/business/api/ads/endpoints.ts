import { baseApi } from "@/business/api/baseApi";
import {
  AdsListResponseDto,
  AdsItemResponseDto,
  AdsCreateAd,
  UpdatePlaylistArgs,
  FetchAdsArgs,
  PhotosList,
} from "@/business/types/dto/ads.dto";

const ADS_LIST_TAG_ID = "LIST";

type QueryParamValue = string | number | boolean | Date | undefined;

const getAdsItemTags = (items?: AdsItemResponseDto[]) =>
  items?.map((item) => ({ type: "AdsItem" as const, id: item.id })) ?? [];

function buildQueryParams(
  args: FetchAdsArgs,
  cursor?: string,
): Record<string, string> {
  const rawParams: Record<string, QueryParamValue> = {
    cursor,
    pageSize: args.pageSize ?? 40,
    pageNumber: args.pageNumber,
    search: args.search,
    category: args.category,
    subCategory: args.subCategory,
    priceFrom: args.priceFrom,
    priceTo: args.priceTo,
    deposit: args.deposit,
    city: args.city,
    radius: args.radius,
    availableFrom: args.availableFrom
      ? new Date(args.availableFrom)
      : undefined,
    availableTo: args.availableTo ? new Date(args.availableTo) : undefined,
    minRating: args.minRating,
    favoritesOnly: args.favoritesOnly,
    sortBy: args.sortBy,
    sortDirection: args.sortDirection,
  };

  return Object.fromEntries(
    Object.entries(rawParams).flatMap(([key, value]) => {
      if (value === undefined) {
        return [];
      }

      if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? [] : [[key, value.toISOString()]];
      }

      return [[key, String(value)]];
    }),
  );
}

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
        params: buildQueryParams(queryArg, pageParam),
      }),
      providesTags: (result) => [
        { type: "Ads", id: ADS_LIST_TAG_ID },
        ...getAdsItemTags(result?.pages.flatMap((page) => page.items)),
      ],
      keepUnusedDataFor: 300,
    }),

    fetchAdById: build.query<AdsItemResponseDto, string>({
      query: (id) => ({ url: `ads/${id}` }),
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
      invalidatesTags: [{ type: "Ads", id: ADS_LIST_TAG_ID }],
    }),
    deleteAd: build.mutation<void, string>({
      query: (adId) => ({
        url: `ads/${adId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, adId) => [
        { type: "Ads", id: ADS_LIST_TAG_ID },
        { type: "AdsItem", id: adId },
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
        { type: "Ads", id: ADS_LIST_TAG_ID },
        { type: "AdsItem", id: adId },
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
          { type: "Ads", id: ADS_LIST_TAG_ID },
        ],
      },
    ),
  }),
});

export const {
  useFetchAdByIdQuery,
  useFetchAdsInfiniteQuery,
  useCreateAdMutation,
  useDeleteAdMutation,
  useUpdateAdMutation,
  useUploadAdPhotosMutation,
} = adsApi;
