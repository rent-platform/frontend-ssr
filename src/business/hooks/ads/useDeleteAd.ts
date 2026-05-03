"use client";
import { useDeleteAdMutation } from "@/business/api";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
export function useDeleteAd() {
  const [deleteAd, { isLoading: isDeleting, isError, error, reset }] =
    useDeleteAdMutation();
  const deleteError: ApiUiError | null = getApiError(error);

  return {
    deleteAd,
    isDeleting,
    isError,
    deleteError,
    reset,
  };
}
