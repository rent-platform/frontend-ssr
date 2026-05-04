"use client";

import { useCancelDealMutation } from "../api";
import { mapDealToVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { DealDetailsVM } from "../types";

export interface UseCancelDealResult {
  cancelDeal: (dealId: string, reason?: string) => Promise<unknown>;
  deal: DealDetailsVM | null;
  isCancelling: boolean;
  isError: boolean;
  cancelError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useCancelDeal(): UseCancelDealResult {
  const [
    cancelDealMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useCancelDealMutation();

  return {
    cancelDeal: (dealId, reason = "") =>
      cancelDealMutation({ id: dealId, body: { reason } }),
    deal: data ? mapDealToVM(data) : null,
    isCancelling: isLoading,
    isError,
    cancelError: getApiError(error),
    isSuccess,
    reset,
  };
}



