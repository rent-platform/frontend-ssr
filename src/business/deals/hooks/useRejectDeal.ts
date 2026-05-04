"use client";

import { useRejectDealMutation } from "../api";
import { mapDealToVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { DealDetailsVM, RejectDealRequestDto } from "../types";

export interface UseRejectDealResult {
  rejectDeal: (dealId: string, body?: RejectDealRequestDto) => Promise<unknown>;
  deal: DealDetailsVM | null;
  isRejecting: boolean;
  isError: boolean;
  rejectError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useRejectDeal(): UseRejectDealResult {
  const [
    rejectDealMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useRejectDealMutation();

  return {
    rejectDeal: (dealId, body) =>
      rejectDealMutation({ id: dealId, body: body ?? { reason: "" } }),
    deal: data ? mapDealToVM(data) : null,
    isRejecting: isLoading,
    isError,
    rejectError: getApiError(error),
    isSuccess,
    reset,
  };
}



