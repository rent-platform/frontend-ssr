"use client";

import { useCancelPaymentMutation } from "@/business/api";
import type { Payment } from "@/business/types/dto/payments.dto";

export interface UseCancelPaymentResult {
  cancelPayment: (paymentId: string, dealId?: string) => Promise<unknown>;
  payment: Payment | null;
  isCancelling: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useCancelPayment(): UseCancelPaymentResult {
  const [cancelPaymentMutation, { data, isLoading, isError, isSuccess, reset }] =
    useCancelPaymentMutation();

  return {
    cancelPayment: (paymentId, dealId) =>
      cancelPaymentMutation({ paymentId, dealId }),
    payment: data ?? null,
    isCancelling: isLoading,
    isError,
    isSuccess,
    reset,
  };
}
