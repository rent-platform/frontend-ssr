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
    createAd: (payload: Parameters<typeof createAd>[0]) => {
      console.log("[TRACE][CREATE_LISTING][HOOK] createAd mutation start", payload);
      return createAd(payload);
    },
    isCreating,
    isError,
    createError,
    isSuccess,
    reset,
  };
}




