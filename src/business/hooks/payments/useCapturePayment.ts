"use client";

import { useCapturePaymentMutation } from "@/business/api";
import { getApiError } from "@/business/utils";
import { type ApiUiError } from "@/business/types";
import type { CapturePaymentRequest, Payment } from "@/business/types";

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
