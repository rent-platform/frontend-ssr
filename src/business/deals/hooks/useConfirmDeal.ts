"use client";

import { useConfirmDealMutation } from "../api";
import { mapDealToVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { DealDetailsVM } from "../types";

export interface UseConfirmDealResult {
  confirmDeal: (dealId: string) => Promise<unknown>;
  deal: DealDetailsVM | null;
  isConfirming: boolean;
  isError: boolean;
  confirmError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useConfirmDeal(): UseConfirmDealResult {
  const [
    confirmDealMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useConfirmDealMutation();

  return {
    confirmDeal: (dealId) => confirmDealMutation(dealId),
    deal: data ? mapDealToVM(data) : null,
    isConfirming: isLoading,
    isError,
    confirmError: getApiError(error),
    isSuccess,
    reset,
  };
}



