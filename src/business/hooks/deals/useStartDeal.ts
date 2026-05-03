"use client";

import { useStartDealMutation } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { DealDetailsVM } from "@/business/types";

export interface UseStartDealResult {
  startDeal: (dealId: string) => Promise<unknown>;
  deal: DealDetailsVM | null;
  isStarting: boolean;
  isError: boolean;
  startError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useStartDeal(): UseStartDealResult {
  const [
    startDealMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useStartDealMutation();

  return {
    startDeal: (dealId) => startDealMutation(dealId),
    deal: data ? mapDealToVM(data) : null,
    isStarting: isLoading,
    isError,
    startError: getApiError(error),
    isSuccess,
    reset,
  };
}
