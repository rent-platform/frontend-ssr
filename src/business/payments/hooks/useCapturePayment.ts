"use client";

import { useCapturePaymentMutation } from "../api";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { CapturePaymentRequest, Payment } from "../types";

export interface UseCapturePaymentResult {
  capturePayment: (
    paymentId: string,
    body: CapturePaymentRequest,
    dealId?: string,
  ) => Promise<unknown>;
  payment: Payment | null;
  isCapturing: boolean;
  isError: boolean;
  captureError: ApiUiError | null;
  isSuccess: boolean;
  reset: () => void;
}

export function useCapturePayment(): UseCapturePaymentResult {
  const [
    capturePaymentMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useCapturePaymentMutation();

  return {
    capturePayment: (paymentId, body, dealId) =>
      capturePaymentMutation({ paymentId, body, dealId }),
    payment: data ?? null,
    isCapturing: isLoading,
    isError,
    captureError: getApiError(error),
    isSuccess,
    reset,
  };
}



