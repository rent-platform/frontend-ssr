"use client";

import { useFetchPaymentByDealQuery } from "@/business/api";
import type { Payment } from "@/business/types/dto/payments.dto";

export interface UseGetPaymentByDealResult {
  payment: Payment | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useGetPaymentByDeal(dealId: string): UseGetPaymentByDealResult {
  const { data, isLoading, isFetching, isError, refetch } =
    useFetchPaymentByDealQuery(dealId);

  return {
    payment: data ?? null,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
