"use client";

import { useCancelPaymentMutation } from "@/business/api";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { Payment } from "@/business/types";

export interface UseCancelPaymentResult {
  cancelPayment: (paymentId: string, dealId?: string) => Promise<unknown>;
  payment: Payment | null;
  isCancelling: boolean;
  isError: boolean;
  cancelError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useCancelPayment(): UseCancelPaymentResult {
  const [
    cancelPaymentMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useCancelPaymentMutation();

  return {
    cancelPayment: (paymentId, dealId) =>
      cancelPaymentMutation({ paymentId, dealId }),
    payment: data ?? null,
    isCancelling: isLoading,
    isError,
    cancelError: getApiError(error),
    isSuccess,
    reset,
  };
}
