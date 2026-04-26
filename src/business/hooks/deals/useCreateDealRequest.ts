"use client";

import { useCreateDealRequestMutation } from "@/business/api";
import { mapDealToVM } from "@/business/mappers";
import type { CreateDealRequestDto } from "@/business/types/dto/deals.dto";
import type { DealDetailsVM } from "@/business/types/view";

export interface UseCreateDealRequestResult {
  createDealRequest: (payload: CreateDealRequestDto) => Promise<unknown>;
  deal: DealDetailsVM | null;
  isCreating: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useCreateDealRequest(): UseCreateDealRequestResult {
  const [createDealRequestMutation, { data, isLoading, isError, isSuccess, reset }] =
    useCreateDealRequestMutation();

  return {
    createDealRequest: (payload) => createDealRequestMutation(payload),
    deal: data ? mapDealToVM(data) : null,
    isCreating: isLoading,
    isError,
    isSuccess,
    reset,
  };
}
