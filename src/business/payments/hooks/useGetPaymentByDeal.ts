"use client";

import { useFetchPaymentByDealQuery } from "../api";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { Payment } from "../types";

export interface UseGetPaymentByDealResult {
  payment: Payment | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetPaymentByDeal(dealId: string): UseGetPaymentByDealResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchPaymentByDealQuery(dealId);

  return {
    payment: data ?? null,
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}



