"use client";
import { useUpdateAdMutation } from "../api";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { UpdatePlaylistArgs } from "../types";

export function useUpdateAd() {
  const [updateAd, { isLoading: isUpdating, isError, error, reset }] =
    useUpdateAdMutation();
  const updateError: ApiUiError | null = getApiError(error);

  return {
    updateAd: (adId: string, payload: UpdatePlaylistArgs) =>
      updateAd({ adId, payload }),
    isUpdating,
    isError,
    updateError,
    reset,
  };
}




