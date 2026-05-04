import { adsApi } from "@/business/ads/api";
import type { InfiniteData } from "@reduxjs/toolkit/query";
import { baseApi } from "@/business/shared";
import type {
  AdsItemResponseDto,
  AdsListResponseDto,
  FetchAdsArgs,
} from "@/business/ads/types";
import type { FavoriteMutationArgs, FavoriteResponseDto } from "../types";

const FAVORITES_LIST_TAG_ID = "LIST";

type AdsInfiniteData = InfiniteData<AdsListResponseDto, string | undefined>;
type OptimisticPatch = {
  undo: () => void;
};

const patchAdFavoriteStatus = (
  ad: AdsItemResponseDto,
  adId: string,
  isFavorite: boolean,
) => {
  if (ad.id === adId) {
    ad.is_favorite = isFavorite;
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
      page.items = page.items.filter((item) => item.id !== adId);
      continue;
    }

    for (const item of page.items) {
      patchAdFavoriteStatus(item, adId, isFavorite);
    }
  }
};

export const favoritesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    addFavorite: build.mutation<FavoriteResponseDto, FavoriteMutationArgs>({
      query: ({ adId }) => ({
        url: "favorites",
        method: "POST",
        body: { adId },
      }),
      async onQueryStarted({ adId }, { dispatch, getState, queryFulfilled }) {
        const patches: OptimisticPatch[] = [
          dispatch(
            adsApi.util.updateQueryData("fetchAdById", adId, (draft) => {
              patchAdFavoriteStatus(draft, adId, true);
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
                patchAdsListFavoriteStatus(draft, adId, true, args);
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
      invalidatesTags: (_result, _error, { adId }) => [
        { type: "Favorites", id: FAVORITES_LIST_TAG_ID },
        { type: "Favorites", id: adId },
        { type: "AdsItem", id: adId },
      ],
    }),

    removeFavorite: build.mutation<FavoriteResponseDto, FavoriteMutationArgs>({
      query: ({ adId }) => ({
        url: `favorites/${adId}`,
        method: "DELETE",
      }),
      async onQueryStarted({ adId }, { dispatch, getState, queryFulfilled }) {
        const patches: OptimisticPatch[] = [
          dispatch(
            adsApi.util.updateQueryData("fetchAdById", adId, (draft) => {
              patchAdFavoriteStatus(draft, adId, false);
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
                patchAdsListFavoriteStatus(draft, adId, false, args);
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
      invalidatesTags: (_result, _error, { adId }) => [
        { type: "Favorites", id: FAVORITES_LIST_TAG_ID },
        { type: "Favorites", id: adId },
        { type: "AdsItem", id: adId },
      ],
    }),
  }),
});

export const { useAddFavoriteMutation, useRemoveFavoriteMutation } =
  favoritesApi;
