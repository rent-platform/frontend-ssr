"use client";

import { getApiError, type ApiUiError } from "@/business/shared";
import { useRemoveFavoriteMutation } from "../api";
import type { FavoriteMutationArgs } from "../types";

export type UseRemoveFavoriteResult = {
  removeFavorite: (payload: FavoriteMutationArgs) => Promise<unknown>;
  isRemoving: boolean;
  isError: boolean;
  removeError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
};

export function useRemoveFavorite(): UseRemoveFavoriteResult {
  const [
    removeFavoriteMutation,
    { isLoading, isError, error, isSuccess, reset },
  ] = useRemoveFavoriteMutation();

  return {
    removeFavorite: (payload) => removeFavoriteMutation(payload),
    isRemoving: isLoading,
    isError,
    removeError: getApiError(error),
    isSuccess,
    reset,
  };
}

