import { adsApi } from "@/business/ads/api";
import type { InfiniteData } from "@reduxjs/toolkit/query";
import { baseApi } from "@/business/shared";
import type {
  AdsItemResponseDto,
  AdsListResponseDto,
  FetchAdsArgs,
  ItemShortResponseDto,
} from "@/business/ads/types";
import type {
  FavoriteMutationArgs,
  FavoriteResponseDto,
  FavoriteStatusResponseDto,
} from "../types";

const FAVORITES_LIST_TAG_ID = "LIST";
type QueryParamValue = string | number | undefined;

type AdsInfiniteData = InfiniteData<AdsListResponseDto, number>;
type OptimisticPatch = {
  undo: () => void;
};

function buildFavoritesParams(args?: FetchAdsArgs): Record<string, string> {
  if (!args) return {};

  const rawParams: Record<string, QueryParamValue> = {
    page: args.pageNumber ?? 0,
    size: args.pageSize ?? 20,
    sortBy: args.sortBy,
    sortDirection: args.sortDirection,
  };

  return Object.fromEntries(
    Object.entries(rawParams).flatMap(([key, value]) => {
      if (value === undefined || value === "") return [];
      return [[key, String(value)]];
    }),
  );
}

const patchAdFavoriteStatus = (
  ad: AdsItemResponseDto | ItemShortResponseDto,
  adId: string,
  isFavorite: boolean,
) => {
  if (ad.id === adId) {
    ad.isFavorite = isFavorite;
  }
};

const patchAdsListFavoriteStatus = (
  draft: AdsInfiniteData,
  adId: string,
  isFavorite: boolean,
  queryArgs: FetchAdsArgs,
) => {
  for (const page of draft.pages) {
    if (!isFavorite && queryArgs.favoritesOnly) {
      page.content = page.content.filter((item) => item.id !== adId);
      continue;
    }

    for (const item of page.content) {
      patchAdFavoriteStatus(item, adId, isFavorite);
    }
  }
};

export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchFavoriteStatus: build.query<FavoriteStatusResponseDto, string>({
      query: (itemId) => ({
        url: `api/catalog/favorites/${itemId}/status`,
      }),
      transformResponse: (isFavorite: boolean, _meta, itemId) => ({
        itemId,
        isFavorite,
      }),
      providesTags: (_result, _error, itemId) => [
        { type: "Favorites", id: itemId },
      ],
    }),

    fetchMyFavorites: build.query<AdsListResponseDto, FetchAdsArgs | void>({
      query: (args) => ({
        url: "api/catalog/favorites/my",
        params: buildFavoritesParams(args || undefined),
      }),
      providesTags: (result) => [
        { type: "Favorites", id: FAVORITES_LIST_TAG_ID },
        ...(result?.content.map((item) => ({
          type: "Favorites" as const,
          id: item.id,
        })) ?? []),
      ],
    }),

    addFavorite: build.mutation<FavoriteResponseDto, FavoriteMutationArgs>({
      query: ({ itemId }) => ({
        url: `api/catalog/favorites/${itemId}`,
        method: "POST",
      }),
      async onQueryStarted({ itemId }, { dispatch, getState, queryFulfilled }) {
        const patches: OptimisticPatch[] = [
          dispatch(
            adsApi.util.updateQueryData("fetchAdById", itemId, (draft) => {
              patchAdFavoriteStatus(draft, itemId, true);
            }),
          ),
        ];

        const cachedFetchAdsArgs = adsApi.util.selectCachedArgsForQuery(
          getState(),
          "fetchAds",
        );

        for (const args of cachedFetchAdsArgs) {
          patches.push(
            dispatch(
              adsApi.util.updateQueryData("fetchAds", args, (draft) => {
                patchAdsListFavoriteStatus(draft, itemId, true, args);
              }),
            ),
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      transformResponse: (
        response: { message?: string },
        _meta,
        { itemId },
      ) => ({
        ...response,
        itemId,
        isFavorite: true,
      }),
      invalidatesTags: (_result, _error, { itemId }) => [
        { type: "Favorites", id: FAVORITES_LIST_TAG_ID },
        { type: "Favorites", id: itemId },
        { type: "AdsItem", id: itemId },
      ],
    }),

    removeFavorite: build.mutation<FavoriteResponseDto, FavoriteMutationArgs>({
      query: ({ itemId }) => ({
        url: `api/catalog/favorites/${itemId}`,
        method: "DELETE",
      }),
      transformResponse: (
        response: { message?: string },
        _meta,
        { itemId },
      ) => ({
        ...response,
        itemId,
        isFavorite: false,
      }),
      async onQueryStarted({ itemId }, { dispatch, getState, queryFulfilled }) {
        const patches: OptimisticPatch[] = [
          dispatch(
            adsApi.util.updateQueryData("fetchAdById", itemId, (draft) => {
              patchAdFavoriteStatus(draft, itemId, false);
            }),
          ),
        ];

        const cachedFetchAdsArgs = adsApi.util.selectCachedArgsForQuery(
          getState(),
          "fetchAds",
        );

        for (const args of cachedFetchAdsArgs) {
          patches.push(
            dispatch(
              adsApi.util.updateQueryData("fetchAds", args, (draft) => {
                patchAdsListFavoriteStatus(draft, itemId, false, args);
              }),
            ),
          );
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (_result, _error, { itemId }) => [
        { type: "Favorites", id: FAVORITES_LIST_TAG_ID },
        { type: "Favorites", id: itemId },
        { type: "AdsItem", id: itemId },
      ],
    }),
  }),
});

export const {
  useFetchFavoriteStatusQuery,
  useFetchMyFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoritesApi;
