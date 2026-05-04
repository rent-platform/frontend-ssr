"use client";

import { useCreateDealRequestMutation } from "../api";
import { mapDealToVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { CreateDealRequestDto, DealDetailsVM } from "../types";

export interface UseCreateDealRequestResult {
  createDealRequest: (payload: CreateDealRequestDto) => Promise<unknown>;
  deal: DealDetailsVM | null;
  isCreating: boolean;
  isError: boolean;
  createError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useCreateDealRequest(): UseCreateDealRequestResult {
  const [
    createDealRequestMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useCreateDealRequestMutation();

  return {
    createDealRequest: (payload) => createDealRequestMutation(payload),
    deal: data ? mapDealToVM(data) : null,
    isCreating: isLoading,
    isError,
    createError: getApiError(error),
    isSuccess,
    reset,
  };
}



