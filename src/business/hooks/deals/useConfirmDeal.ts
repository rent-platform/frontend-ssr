"use client";

import { useConfirmDealMutation } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { DealDetailsVM } from "@/business/types";

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
