"use client";
import { useUpdateAdMutation } from "@/business/api";
import type { UpdatePlaylistArgs } from "@/business/types/dto/ads.dto";

export function useUpdateAd() {
  const [updateAd, { isLoading: isUpdating, isError, reset }] =
    useUpdateAdMutation();

  return {
    updateAd: (adId: string, payload: UpdatePlaylistArgs) =>
      updateAd({ adId, payload }),
    isUpdating,
    isError,
    reset,
  };
}
