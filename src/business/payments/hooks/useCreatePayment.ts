"use client";

import { useCreatePaymentMutation } from "../api";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { CreatePaymentRequest, PaymentConfirmationResponse } from "../types";

export interface UseCreatePaymentResult {
  createPayment: (payload: CreatePaymentRequest) => Promise<unknown>;
  payment: PaymentConfirmationResponse | null;
  isCreating: boolean;
  isError: boolean;
  createError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useCreatePayment(): UseCreatePaymentResult {
  const [
    createPaymentMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useCreatePaymentMutation();

  return {
    createPayment: (payload) => createPaymentMutation(payload),
    payment: data ?? null,
    isCreating: isLoading,
    isError,
    createError: getApiError(error),
    isSuccess,
    reset,
  };
}



