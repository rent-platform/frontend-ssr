"use client";

import { useCreatePaymentMutation } from "../api";
import { getApiError, type ApiUiError } from "@/business/shared";
import type { CreatePaymentRequest, PaymentConfirmationResponse } from "../types";

export interface UseCreatePaymentResult {
  createPayment: (payload: CreatePaymentRequest) => Promise<PaymentConfirmationResponse>;
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
  const createError: ApiUiError | null = getApiError(error);

  return {
    createPayment: async (payload) => {
      console.log("[TRACE][DEAL_STATUS][PAYMENT] create payment invoice start", {
        dealId: payload.dealId,
        rentalAmount: payload.rentalAmount,
        depositAmount: payload.depositAmount,
      });

      try {
        const result = await createPaymentMutation(payload).unwrap();
        console.log("[TRACE][DEAL_STATUS][PAYMENT] create payment invoice success", {
          dealId: payload.dealId,
          paymentId: result.paymentId,
          paymentStatus: result.status,
          hasConfirmationUrl: Boolean(result.confirmationUrl),
        });
        return result;
      } catch (paymentError) {
        console.log("[TRACE][DEAL_STATUS][PAYMENT] create payment invoice failed", {
          dealId: payload.dealId,
          error: getApiError(paymentError) ?? paymentError,
        });
        throw paymentError;
      }
    },
    payment: data ?? null,
    isCreating: isLoading,
    isError,
    createError,
    isSuccess,
    reset,
  };
}
