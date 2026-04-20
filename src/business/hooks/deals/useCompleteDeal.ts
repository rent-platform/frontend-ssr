"use client";

import { useCompleteDealMutation } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import type { DealDetailsVM } from "@/business/types/view";

export interface UseCompleteDealResult {
  completeDeal: (dealId: string) => Promise<unknown>;
  deal: DealDetailsVM | null;
  isCompleting: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useCompleteDeal(): UseCompleteDealResult {
  const [completeDealMutation, { data, isLoading, isError, isSuccess, reset }] =
    useCompleteDealMutation();

  return {
    completeDeal: (dealId) => completeDealMutation(dealId),
    deal: data ? mapDealToVM(data) : null,
    isCompleting: isLoading,
    isError,
    isSuccess,
    reset,
  };
}
