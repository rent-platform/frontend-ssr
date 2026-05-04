import { baseApi } from "@/business/shared";
import {
  AdsListResponseDto,
  AdsItemResponseDto,
  AdsCreateAd,
  UpdatePlaylistArgs,
  FetchAdsArgs,
  PhotosList,
} from "../types";

const ADS_LIST_TAG_ID = "LIST";

// Допустимые типы значений для query-параметров.
type QueryParamValue = string | number | boolean | Date | undefined;

// Формирование тегов для отдельных объявлений.
const getAdsItemTags = (items?: AdsItemResponseDto[]) =>
  items?.map((item) => ({ type: "AdsItem" as const, id: item.id })) ?? [];

// Преобразование объекта фильтров в query-параметры URL.
function buildQueryParams(
  args: FetchAdsArgs,
  cursor?: string,
): Record<string, string> {
  // Исходный набор параметров запроса.
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
      // Пустые значения не добавляются в URL.
      if (value === undefined) {
        return [];
      }

      // Даты приводятся к ISO-формату.
      if (value instanceof Date) {
        return Number.isNaN(value.getTime())
          ? []
          : [[key, value.toISOString()]];
      }

      // Остальные значения приводятся к строке.
      return [[key, String(value)]];
    }),
  );
}

// Подключение модуля объявлений к baseApi.
export const adsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Query для постраничной загрузки списка объявлений.
    fetchAds: build.infiniteQuery<
      AdsListResponseDto,
      FetchAdsArgs,
      string | undefined
    >({
      // Настройки бесконечной пагинации.
      infiniteQueryOptions: {
        // Начальное значение курсора.
        initialPageParam: undefined,
        // Получение курсора следующей страницы.
        getNextPageParam: (lastPage) => {
          return lastPage.meta.nextCursor || undefined;
        },
      },
      // Описание HTTP-запроса для получения списка.
      query: ({ pageParam, queryArg }) => ({
        url: `ads`,
        params: buildQueryParams(queryArg, pageParam),
      }),
      // Теги кэша для списка и отдельных объявлений.
      providesTags: (result) => [
        { type: "Ads", id: ADS_LIST_TAG_ID },
        ...getAdsItemTags(result?.pages.flatMap((page) => page.items)),
      ],
      // Время хранения неиспользуемого кэша.
      keepUnusedDataFor: 300,
    }),

    // Query для получения объявления по идентификатору.
    fetchAdById: build.query<AdsItemResponseDto, string>({
      query: (id) => ({ url: `ads/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "AdsItem", id }],
    }),

    // Mutation для создания нового объявления.
    createAd: build.mutation<AdsItemResponseDto, AdsCreateAd>({
      // Описание POST-запроса на создание объявления.
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
      // Сброс кэша списка после создания объявления.
      invalidatesTags: [{ type: "Ads", id: ADS_LIST_TAG_ID }],
    }),
    deleteAd: build.mutation<void, string>({
      // Описание DELETE-запроса на удаление объявления.
      query: (adId) => ({
        url: `ads/${adId}`,
        method: "DELETE",
      }),
      // Сброс кэша списка и карточки объявления.
      invalidatesTags: (_result, _error, adId) => [
        { type: "Ads", id: ADS_LIST_TAG_ID },
        { type: "AdsItem", id: adId },
      ],
    }),
    updateAd: build.mutation<
      void,
      { adId: string; payload: UpdatePlaylistArgs }
    >({
      // Описание PUT-запроса на обновление объявления.
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
      // Сброс кэша после изменения объявления.
      invalidatesTags: (_result, _error, { adId }) => [
        { type: "Ads", id: ADS_LIST_TAG_ID },
        { type: "AdsItem", id: adId },
      ],
    }),
    uploadAdPhotos: build.mutation<PhotosList, { adId: string; files: File[] }>(
      {
        // Описание запроса на загрузку фотографий объявления.
        query: ({ adId, files }) => {
          // Формирование multipart/form-data тела запроса.
          const formData = new FormData();
          files.forEach((file) => formData.append("photos", file));

          return {
            url: `ads/${adId}/photos`,
            method: "POST",
            body: formData,
          };
        },
        // Сброс кэша карточки и списка после загрузки фото.
        invalidatesTags: (_result, _error, { adId }) => [
          { type: "AdsItem", id: adId },
          { type: "Ads", id: ADS_LIST_TAG_ID },
        ],
      },
    ),
  }),
});

// Экспорт автоматически сгенерированных RTK Query hooks.
export const {
  useFetchAdByIdQuery,
  useFetchAdsInfiniteQuery,
  useCreateAdMutation,
  useDeleteAdMutation,
  useUpdateAdMutation,
  useUploadAdPhotosMutation,
} = adsApi;




