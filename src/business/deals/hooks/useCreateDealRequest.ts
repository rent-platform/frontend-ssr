"use client";

import { useCreateDealRequestMutation } from "../api";
import { mapDealToVM } from "../mappers";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { CreateDealRequestDto, DealDetailsVM } from "../types";

export interface UseCreateDealRequestResult {
  createDealRequest: (payload: CreateDealRequestDto) => Promise<DealDetailsVM>;
  deal: DealDetailsVM | null;
  isCreating: boolean;
  isError: boolean;
  createError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useCreateDealRequest(): UseCreateDealRequestResult {
  const [
    createDealRequestMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useCreateDealRequestMutation();

  return {
    createDealRequest: async (payload) => {
      console.log("[TRACE][RENT_PAYMENT][DEAL] create rent request start", payload);
      const deal = await createDealRequestMutation(payload).unwrap();
      const vm = mapDealToVM(deal);
      console.log("[TRACE][RENT_PAYMENT][DEAL] create rent request success", {
        dealId: vm.id,
        itemId: vm.itemId,
        status: vm.status,
        totalPrice: vm.totalPrice,
        depositAmount: vm.depositAmount,
      });
      return vm;
    },
    deal: data ? mapDealToVM(data) : null,
    isCreating: isLoading,
    isError,
    createError: getApiError(error),
    isSuccess,
    reset,
  };
}



