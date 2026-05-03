"use client";

import { useRejectDealMutation } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { DealDetailsVM, RejectDealRequestDto } from "@/business/types";

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
    rejectDeal: (dealId, body) => rejectDealMutation({ id: dealId, body }),
    deal: data ? mapDealToVM(data) : null,
    isRejecting: isLoading,
    isError,
    rejectError: getApiError(error),
    isSuccess,
    reset,
  };
}
