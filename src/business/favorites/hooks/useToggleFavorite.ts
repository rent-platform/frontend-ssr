"use client";

import { useCallback } from "react";
import { getApiError, type ApiUiError } from "@/business/shared";
import { useAddFavoriteMutation, useRemoveFavoriteMutation } from "../api";

export type UseToggleFavoriteArgs = {
  adId: string;
  isFavorite?: boolean;
};

export type UseToggleFavoriteResult = {
  toggleFavorite: () => Promise<unknown>;
  addFavorite: () => Promise<unknown>;
  removeFavorite: () => Promise<unknown>;
  isLoading: boolean;
  isAdding: boolean;
  isRemoving: boolean;
  error: ApiUiError | null;
  reset: () => void;
};

export function useToggleFavorite({
  adId,
  isFavorite = false,
}: UseToggleFavoriteArgs): UseToggleFavoriteResult {
  const [
    addFavoriteMutation,
    { isLoading: isAdding, error: addError, reset: resetAdd },
  ] = useAddFavoriteMutation();
  const [
    removeFavoriteMutation,
    { isLoading: isRemoving, error: removeError, reset: resetRemove },
  ] = useRemoveFavoriteMutation();

  const addFavorite = useCallback(
    () => addFavoriteMutation({ adId }),
    [addFavoriteMutation, adId],
  );

  const removeFavorite = useCallback(
    () => removeFavoriteMutation({ adId }),
    [removeFavoriteMutation, adId],
  );

  const toggleFavorite = useCallback(
    () => (isFavorite ? removeFavorite() : addFavorite()),
    [addFavorite, isFavorite, removeFavorite],
  );

  const reset = useCallback(() => {
    resetAdd();
    resetRemove();
  }, [resetAdd, resetRemove]);

  return {
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isLoading: isAdding || isRemoving,
    isAdding,
    isRemoving,
    error: getApiError(addError) ?? getApiError(removeError),
    reset,
  };
}

