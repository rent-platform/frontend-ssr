"use client";
import { useCreateAdMutation } from "@/business/api";

export function useCreateAd() {
  const [createAd, { isLoading: isCreating, isError, isSuccess, reset }] =
    useCreateAdMutation();

  return {
    createAd,
    isCreating,
    isError,
    isSuccess,
    reset,
  };
}
