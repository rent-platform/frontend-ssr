"use client";

import { useStartDealMutation } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import type { DealDetailsVM } from "@/business/types/view";

export interface UseStartDealResult {
  startDeal: (dealId: string) => Promise<unknown>;
  deal: DealDetailsVM | null;
  isStarting: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useStartDeal(): UseStartDealResult {
  const [startDealMutation, { data, isLoading, isError, isSuccess, reset }] =
    useStartDealMutation();

  return {
    startDeal: (dealId) => startDealMutation(dealId),
    deal: data ? mapDealToVM(data) : null,
    isStarting: isLoading,
    isError,
    isSuccess,
    reset,
  };
}
