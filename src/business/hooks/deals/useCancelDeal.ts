"use client";

import { useCancelDealMutation } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import type { DealDetailsVM } from "@/business/types/view";

export interface UseCancelDealResult {
  cancelDeal: (dealId: string) => Promise<unknown>;
  deal: DealDetailsVM | null;
  isCancelling: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useCancelDeal(): UseCancelDealResult {
  const [cancelDealMutation, { data, isLoading, isError, isSuccess, reset }] =
    useCancelDealMutation();

  return {
    cancelDeal: (dealId) => cancelDealMutation(dealId),
    deal: data ? mapDealToVM(data) : null,
    isCancelling: isLoading,
    isError,
    isSuccess,
    reset,
  };
}
