"use client";

import { getApiError, type ApiUiError } from "@/business/shared";
import { useDeleteCurrentProfileMutation } from "../api";

export interface UseDeleteCurrentProfileResult {
  deleteCurrentProfile: () => Promise<unknown>;
  isDeleting: boolean;
  isError: boolean;
  deleteError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useDeleteCurrentProfile(): UseDeleteCurrentProfileResult {
  const [
    deleteProfileMutation,
    { isLoading, isError, error, isSuccess, reset },
  ] = useDeleteCurrentProfileMutation();

  return {
    deleteCurrentProfile: () => deleteProfileMutation().unwrap(),
    isDeleting: isLoading,
    isError,
    deleteError: getApiError(error),
    isSuccess,
    reset,
  };
}
