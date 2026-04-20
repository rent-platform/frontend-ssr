"use client";

import { useRejectDealMutation } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import type { RejectDealRequestDto } from "@/business/types/dto/deals.dto";
import type { DealDetailsVM } from "@/business/types/view";

export interface UseRejectDealResult {
  rejectDeal: (
    dealId: string,
    body?: RejectDealRequestDto,
  ) => Promise<unknown>;
  deal: DealDetailsVM | null;
  isRejecting: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useRejectDeal(): UseRejectDealResult {
  const [rejectDealMutation, { data, isLoading, isError, isSuccess, reset }] =
    useRejectDealMutation();

  return {
    rejectDeal: (dealId, body) => rejectDealMutation({ id: dealId, body }),
    deal: data ? mapDealToVM(data) : null,
    isRejecting: isLoading,
    isError,
    isSuccess,
    reset,
  };
}
