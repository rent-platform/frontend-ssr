"use client";

import { useFetchPaymentByIdQuery } from "@/business/api";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { Payment } from "@/business/types";

export interface UseGetPaymentByIdResult {
  payment: Payment | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
}

export function useGetPaymentById(paymentId: string): UseGetPaymentByIdResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchPaymentByIdQuery(paymentId);

  return {
    payment: data ?? null,
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}
