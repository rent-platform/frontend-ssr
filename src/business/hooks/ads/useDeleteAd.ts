"use client";
import { useDeleteAdMutation } from "@/business/api";

export function useDeleteAd() {
  const [deleteAd, { isLoading: isDeleting, isError, reset }] =
    useDeleteAdMutation();

  return {
    deleteAd,
    isDeleting,
    isError,
    reset,
  };
}
