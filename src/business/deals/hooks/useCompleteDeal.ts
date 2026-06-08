"use client";

import { useCompleteDealMutation } from "../api";
import { mapDealToVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { DealDetailsVM } from "../types";

export interface UseCompleteDealResult {
  completeDeal: (dealId: string, itemOk?: boolean) => Promise<DealDetailsVM>;
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
    completeDeal: (dealId, itemOk = true) => completeDealMutation({ id: dealId, itemOk })
      .unwrap()
      .then(mapDealToVM),
    deal: data ? mapDealToVM(data) : null,
    isCompleting: isLoading,
    isError,
    completeError: getApiError(error),
    isSuccess,
    reset,
  };
}



