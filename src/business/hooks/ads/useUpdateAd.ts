"use client";
import { useUpdateAdMutation } from "@/business/api";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { UpdatePlaylistArgs } from "@/business/types";

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
