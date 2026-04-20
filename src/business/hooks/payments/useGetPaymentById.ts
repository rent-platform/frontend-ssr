"use client";

import { useFetchPaymentByIdQuery } from "@/business/api";
import type { Payment } from "@/business/types/dto/payments.dto";

export interface UseGetPaymentByIdResult {
  payment: Payment | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useGetPaymentById(paymentId: string): UseGetPaymentByIdResult {
  const { data, isLoading, isFetching, isError, refetch } =
    useFetchPaymentByIdQuery(paymentId);

  return {
    payment: data ?? null,
    isLoading,
    isFetching,
    isError,
    refetch,
  };
}
