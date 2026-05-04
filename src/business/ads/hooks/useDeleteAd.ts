"use client";
import { useDeleteAdMutation } from "../api";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
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




