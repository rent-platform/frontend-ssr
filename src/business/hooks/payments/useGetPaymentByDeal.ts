"use client";

import { useFetchPaymentByDealQuery } from "@/business/api";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { Payment } from "@/business/types";

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
