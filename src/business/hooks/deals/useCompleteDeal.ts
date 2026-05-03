"use client";

import { useCompleteDealMutation } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { DealDetailsVM } from "@/business/types";

export interface UseCompleteDealResult {
  completeDeal: (dealId: string) => Promise<unknown>;
  deal: DealDetailsVM | null;
  isCompleting: boolean;
  isError: boolean;
  completeError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useCompleteDeal(): UseCompleteDealResult {
  const [
    completeDealMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useCompleteDealMutation();

  return {
    completeDeal: (dealId) => completeDealMutation(dealId),
    deal: data ? mapDealToVM(data) : null,
    isCompleting: isLoading,
    isError,
    completeError: getApiError(error),
    isSuccess,
    reset,
  };
}
