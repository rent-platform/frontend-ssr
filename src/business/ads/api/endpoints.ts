import { baseApi } from "@/business/shared";
import {
  AdsListResponseDto,
  AdsItemResponseDto,
  AdsCreateAd,
  UpdatePlaylistArgs,
  FetchAdsArgs,
  FetchAvailabilityArgs,
  AvailabilityResponseDto,
  PhotosList,
} from "../types";

const ADS_LIST_TAG_ID = "LIST";
const CATALOG_ITEMS_URL = "api/catalog/items";

type QueryParamValue = string | number | undefined;

const getAdsItemTags = (items?: AdsItemResponseDto[]) =>
  items?.map((item) => ({ type: "AdsItem" as const, id: item.id })) ?? [];

function buildQueryParams(
  args: FetchAdsArgs,
  page?: number,
): Record<string, string> {
  const rawParams: Record<string, QueryParamValue> = {
    categoryId: args.categoryId,
    city: args.city,
    query: args.search,
    minPricePerDay: args.priceFrom,
    maxPricePerDay: args.priceTo,
    page: page ?? args.pageNumber ?? 0,
    size: args.pageSize ?? 20,
    sortBy: args.sortBy ?? "createdAt",
    sortDirection: args.sortDirection ?? "desc",
  };

  return Object.fromEntries(
    Object.entries(rawParams).flatMap(([key, value]) => {
      if (value === undefined || value === "") return [];
      return [[key, String(value)]];
    }),
  );
}

function mapPhotoRequest(photo: NonNullable<AdsCreateAd["photos"]>[number]) {
  return {
    photoUrl: photo.photoUrl ?? "",
    sortOrder: photo.sortOrder,
  };
}

function mapCatalogMutationBody(body: AdsCreateAd | UpdatePlaylistArgs) {
  return {
    categoryId: body.categoryId,
    title: body.title,
    itemDescription: body.itemDescription,
    pricePerDay: body.pricePerDay,
    pricePerHour: body.pricePerHour,
    depositAmount: body.depositAmount,
    city: body.city,
    pickupLocation: body.pickupLocation,
    photos: body.photos?.map(mapPhotoRequest),
  };
}

export const adsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchAds: build.infiniteQuery<AdsListResponseDto, FetchAdsArgs, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
          return lastPage.last ? undefined : lastPage.number + 1;
        },
      },
      query: ({ pageParam, queryArg }) => ({
        url: CATALOG_ITEMS_URL,
        params: buildQueryParams(queryArg, pageParam),
      }),
      providesTags: (result) => [
        { type: "Ads", id: ADS_LIST_TAG_ID },
        ...getAdsItemTags(result?.pages.flatMap((page) => page.content)),
      ],
      keepUnusedDataFor: 300,
    }),

    fetchAdById: build.query<AdsItemResponseDto, string>({
      query: (id) => ({ url: `${CATALOG_ITEMS_URL}/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "AdsItem", id }],
    }),

    createAd: build.mutation<AdsItemResponseDto, AdsCreateAd>({
      query: (body) => ({
        url: CATALOG_ITEMS_URL,
        method: "POST",
        body: mapCatalogMutationBody(body),
      }),
      invalidatesTags: [{ type: "Ads", id: ADS_LIST_TAG_ID }],
    }),

    deleteAd: build.mutation<void, string>({
      query: (adId) => ({
        url: `${CATALOG_ITEMS_URL}/${adId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, adId) => [
        { type: "Ads", id: ADS_LIST_TAG_ID },
        { type: "AdsItem", id: adId },
      ],
    }),

    updateAd: build.mutation<
      AdsItemResponseDto,
      { adId: string; payload: UpdatePlaylistArgs }
    >({
      query: ({ adId, payload }) => ({
        url: `${CATALOG_ITEMS_URL}/${adId}`,
        method: "PUT",
        body: mapCatalogMutationBody(payload),
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
            url: `${CATALOG_ITEMS_URL}/${adId}/photos`,
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

    fetchItemAvailability: build.query<
      AvailabilityResponseDto[],
      FetchAvailabilityArgs
    >({
      query: ({ itemId, startDate, endDate }) => ({
        url: `${CATALOG_ITEMS_URL}/${itemId}/availability`,
        params: { startDate, endDate },
      }),
      providesTags: (_result, _error, { itemId, startDate, endDate }) => [
        {
          type: "AdsItem",
          id: `AVAILABILITY-${itemId}-${startDate}-${endDate}`,
        },
      ],
    }),
  }),
});

export const {
  useFetchAdByIdQuery,
  useFetchAdsInfiniteQuery,
  useCreateAdMutation,
  useDeleteAdMutation,
  useUpdateAdMutation,
  useUploadAdPhotosMutation,
  useFetchItemAvailabilityQuery,
} = adsApi;
