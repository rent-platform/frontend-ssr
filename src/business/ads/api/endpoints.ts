import { baseApi } from "@/business/shared";
import {
  AdsListResponseDto,
  AdsItemResponseDto,
  AdsCreateAd,
  AddPhotoRequestDto,
  UpdatePlaylistArgs,
  FetchAdsArgs,
  FetchAvailabilityArgs,
  AvailabilityResponseDto,
  AvailabilityDeleteRequestDto,
  AvailabilityUpdateRequestDto,
  CategoryResponseDto,
  CreateCategoryRequestDto,
  ItemDealInfoResponseDto,
  ItemStatsResponseDto,
  PhotoResponseDto,
  RejectItemRequestDto,
  UpdateCategoryRequestDto,
  UpdatePhotoOrderRequestDto,
} from "../types";

const ADS_LIST_TAG_ID = "LIST";
const CATEGORIES_TAG_ID = "CATEGORIES";
const MY_ITEMS_TAG_ID = "MY_ITEMS";
const MODERATION_TAG_ID = "MODERATION";
const CATALOG_ITEMS_URL = "api/catalog/items";
const CATALOG_URL = "api/catalog";

type QueryParamValue = string | number | undefined;

const getAdsItemTags = (items?: Array<{ id: string }>) =>
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
    minPricePerHour: args.minPricePerHour,
    maxPricePerHour: args.maxPricePerHour,
    status: args.status,
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
    photoUrl: photo.photoUrl,
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

    fetchMyAds: build.query<AdsListResponseDto, FetchAdsArgs | void>({
      query: (args) => ({
        url: `${CATALOG_URL}/my/items`,
        params: buildQueryParams(args ?? {}),
      }),
      providesTags: (result) => [
        { type: "Ads", id: MY_ITEMS_TAG_ID },
        ...getAdsItemTags(result?.content),
      ],
    }),

    fetchModerationAds: build.query<AdsListResponseDto, FetchAdsArgs | void>({
      query: (args) => ({
        url: `${CATALOG_URL}/admin/items/moderation`,
        params: buildQueryParams(args ?? {}),
      }),
      providesTags: (result) => [
        { type: "Ads", id: MODERATION_TAG_ID },
        ...getAdsItemTags(result?.content),
      ],
    }),

    fetchSimilarAds: build.query<AdsListResponseDto, string>({
      query: (itemId) => ({ url: `${CATALOG_ITEMS_URL}/${itemId}/similar` }),
      providesTags: (result, _error, itemId) => [
        { type: "AdsItem", id: `SIMILAR-${itemId}` },
        ...getAdsItemTags(result?.content),
      ],
    }),

    fetchItemStats: build.query<ItemStatsResponseDto, string>({
      query: (itemId) => ({ url: `${CATALOG_URL}/my/items/${itemId}/stats` }),
      providesTags: (_result, _error, itemId) => [
        { type: "AdsItem", id: `STATS-${itemId}` },
      ],
    }),

    fetchItemDealInfo: build.query<ItemDealInfoResponseDto, string>({
      query: (itemId) => ({ url: `${CATALOG_ITEMS_URL}/${itemId}/deal-info` }),
      providesTags: (_result, _error, itemId) => [
        { type: "AdsItem", id: `DEAL-INFO-${itemId}` },
      ],
    }),

    fetchCategories: build.query<CategoryResponseDto[], void>({
      query: () => ({ url: `${CATALOG_URL}/categories` }),
      providesTags: [{ type: "Ads", id: CATEGORIES_TAG_ID }],
    }),

    fetchCategoryById: build.query<CategoryResponseDto, number>({
      query: (categoryId) => ({
        url: `${CATALOG_URL}/categories/${categoryId}`,
      }),
      providesTags: (_result, _error, categoryId) => [
        { type: "Ads", id: `CATEGORY-${categoryId}` },
      ],
    }),

    createCategory: build.mutation<
      CategoryResponseDto,
      CreateCategoryRequestDto
    >({
      query: (body) => ({
        url: `${CATALOG_URL}/admin/categories`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Ads", id: CATEGORIES_TAG_ID }],
    }),

    updateCategory: build.mutation<
      CategoryResponseDto,
      { categoryId: number; body: UpdateCategoryRequestDto }
    >({
      query: ({ categoryId, body }) => ({
        url: `${CATALOG_URL}/admin/categories/${categoryId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { categoryId }) => [
        { type: "Ads", id: CATEGORIES_TAG_ID },
        { type: "Ads", id: `CATEGORY-${categoryId}` },
      ],
    }),

    deleteCategory: build.mutation<void, number>({
      query: (categoryId) => ({
        url: `${CATALOG_URL}/admin/categories/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, categoryId) => [
        { type: "Ads", id: CATEGORIES_TAG_ID },
        { type: "Ads", id: `CATEGORY-${categoryId}` },
      ],
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

    sendAdToModeration: build.mutation<AdsItemResponseDto, string>({
      query: (itemId) => ({
        url: `${CATALOG_ITEMS_URL}/${itemId}/send-to-moderation`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, itemId) => [
        { type: "AdsItem", id: itemId },
        { type: "Ads", id: ADS_LIST_TAG_ID },
        { type: "Ads", id: MY_ITEMS_TAG_ID },
      ],
    }),

    returnAdToDraft: build.mutation<AdsItemResponseDto, string>({
      query: (itemId) => ({
        url: `${CATALOG_ITEMS_URL}/${itemId}/return-to-draft`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, itemId) => [
        { type: "AdsItem", id: itemId },
        { type: "Ads", id: MY_ITEMS_TAG_ID },
      ],
    }),

    archiveAd: build.mutation<AdsItemResponseDto, string>({
      query: (itemId) => ({
        url: `${CATALOG_ITEMS_URL}/${itemId}/archive`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, itemId) => [
        { type: "AdsItem", id: itemId },
        { type: "Ads", id: ADS_LIST_TAG_ID },
        { type: "Ads", id: MY_ITEMS_TAG_ID },
      ],
    }),

    restoreAd: build.mutation<AdsItemResponseDto, string>({
      query: (itemId) => ({
        url: `${CATALOG_ITEMS_URL}/${itemId}/restore`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, itemId) => [
        { type: "AdsItem", id: itemId },
        { type: "Ads", id: ADS_LIST_TAG_ID },
        { type: "Ads", id: MY_ITEMS_TAG_ID },
      ],
    }),

    approveAd: build.mutation<AdsItemResponseDto, string>({
      query: (itemId) => ({
        url: `${CATALOG_URL}/admin/items/${itemId}/approve`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, itemId) => [
        { type: "AdsItem", id: itemId },
        { type: "Ads", id: MODERATION_TAG_ID },
      ],
    }),

    rejectAd: build.mutation<
      AdsItemResponseDto,
      { itemId: string; body: RejectItemRequestDto }
    >({
      query: ({ itemId, body }) => ({
        url: `${CATALOG_URL}/admin/items/${itemId}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { itemId }) => [
        { type: "AdsItem", id: itemId },
        { type: "Ads", id: MODERATION_TAG_ID },
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

    addAdPhoto: build.mutation<
      PhotoResponseDto,
      { adId: string; photo: AddPhotoRequestDto }
    >({
      query: ({ adId, photo }) => ({
        url: `${CATALOG_ITEMS_URL}/${adId}/photos`,
        method: "POST",
        body: {
          photoUrl: photo.photoUrl,
          sortOrder: photo.sortOrder,
        },
      }),
      invalidatesTags: (_result, _error, { adId }) => [
        { type: "AdsItem", id: adId },
        { type: "Ads", id: ADS_LIST_TAG_ID },
      ],
    }),

    fetchAdPhotos: build.query<PhotoResponseDto[], string>({
      query: (adId) => ({ url: `${CATALOG_ITEMS_URL}/${adId}/photos` }),
      providesTags: (_result, _error, adId) => [
        { type: "AdsItem", id: `PHOTOS-${adId}` },
      ],
    }),

    deleteAdPhoto: build.mutation<void, { adId: string; photoId: string }>({
      query: ({ adId, photoId }) => ({
        url: `${CATALOG_ITEMS_URL}/${adId}/photos/${photoId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { adId }) => [
        { type: "AdsItem", id: adId },
        { type: "AdsItem", id: `PHOTOS-${adId}` },
      ],
    }),

    updateAdPhotoOrder: build.mutation<
      PhotoResponseDto[],
      { adId: string; body: UpdatePhotoOrderRequestDto }
    >({
      query: ({ adId, body }) => ({
        url: `${CATALOG_ITEMS_URL}/${adId}/photos/order`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { adId }) => [
        { type: "AdsItem", id: adId },
        { type: "AdsItem", id: `PHOTOS-${adId}` },
      ],
    }),

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

    updateItemAvailability: build.mutation<
      AvailabilityResponseDto[],
      { itemId: string; body: AvailabilityUpdateRequestDto }
    >({
      query: ({ itemId, body }) => ({
        url: `${CATALOG_ITEMS_URL}/${itemId}/availability`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { itemId }) => [
        { type: "AdsItem", id: itemId },
      ],
    }),

    deleteItemAvailability: build.mutation<
      void,
      { itemId: string; body: AvailabilityDeleteRequestDto }
    >({
      query: ({ itemId, body }) => ({
        url: `${CATALOG_ITEMS_URL}/${itemId}/availability`,
        method: "DELETE",
        body,
      }),
      invalidatesTags: (_result, _error, { itemId }) => [
        { type: "AdsItem", id: itemId },
      ],
    }),
  }),
});

export const {
  useFetchAdByIdQuery,
  useFetchAdsInfiniteQuery,
  useFetchMyAdsQuery,
  useFetchModerationAdsQuery,
  useFetchSimilarAdsQuery,
  useFetchItemStatsQuery,
  useFetchItemDealInfoQuery,
  useFetchCategoriesQuery,
  useFetchCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateAdMutation,
  useDeleteAdMutation,
  useUpdateAdMutation,
  useSendAdToModerationMutation,
  useReturnAdToDraftMutation,
  useArchiveAdMutation,
  useRestoreAdMutation,
  useApproveAdMutation,
  useRejectAdMutation,
  useAddAdPhotoMutation,
  useFetchAdPhotosQuery,
  useDeleteAdPhotoMutation,
  useUpdateAdPhotoOrderMutation,
  useFetchItemAvailabilityQuery,
  useUpdateItemAvailabilityMutation,
  useDeleteItemAvailabilityMutation,
} = adsApi;
