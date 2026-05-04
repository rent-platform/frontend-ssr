"use client";
import { useCreateAdMutation } from "../api";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";

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




