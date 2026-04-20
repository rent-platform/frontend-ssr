"use client";

import { useCreatePaymentMutation } from "@/business/api";
import type {
  CreatePaymentRequest,
  Payment,
} from "@/business/types/dto/payments.dto";

export interface UseCreatePaymentResult {
  createPayment: (payload: CreatePaymentRequest) => Promise<unknown>;
  payment: Payment | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useCreatePayment(): UseCreatePaymentResult {
  const [
    createPaymentMutation,
    { data, isLoading, isError, isSuccess, reset },
  ] = useCreatePaymentMutation();

  return {
    createPayment: (payload) => createPaymentMutation(payload),
    payment: data ?? null,
    isLoading: isLoading,
    isError,
    isSuccess,
    reset,
  };
}
