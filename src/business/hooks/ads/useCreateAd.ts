"use client";
import { useCreateAdMutation } from "@/business/api";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";

export function useCreateAd() {
  const [
    createAd,
    { isLoading: isCreating, isError, isSuccess, error, reset },
  ] = useCreateAdMutation();
  const createError: ApiUiError | null = getApiError(error);

  return {
    createAd,
    isCreating,
    isError,
    createError,
    isSuccess,
    reset,
  };
}
