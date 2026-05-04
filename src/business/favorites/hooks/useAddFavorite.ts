"use client";

import { getApiError, type ApiUiError } from "@/business/shared";
import { useAddFavoriteMutation } from "../api";
import type { FavoriteMutationArgs } from "../types";

export type UseAddFavoriteResult = {
  addFavorite: (payload: FavoriteMutationArgs) => Promise<unknown>;
  isAdding: boolean;
  isError: boolean;
  addError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
};

export function useAddFavorite(): UseAddFavoriteResult {
  const [addFavoriteMutation, { isLoading, isError, error, isSuccess, reset }] =
    useAddFavoriteMutation();

  return {
    addFavorite: (payload) => addFavoriteMutation(payload),
    isAdding: isLoading,
    isError,
    addError: getApiError(error),
    isSuccess,
    reset,
  };
}

