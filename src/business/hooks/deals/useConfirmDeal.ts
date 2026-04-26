"use client";

import { useConfirmDealMutation } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import type { DealDetailsVM } from "@/business/types/view";

export interface UseConfirmDealResult {
  confirmDeal: (dealId: string) => Promise<unknown>;
  deal: DealDetailsVM | null;
  isConfirming: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useConfirmDeal(): UseConfirmDealResult {
  const [confirmDealMutation, { data, isLoading, isError, isSuccess, reset }] =
    useConfirmDealMutation();

  return {
    confirmDeal: (dealId) => confirmDealMutation(dealId),
    deal: data ? mapDealToVM(data) : null,
    isConfirming: isLoading,
    isError,
    isSuccess,
    reset,
  };
}
