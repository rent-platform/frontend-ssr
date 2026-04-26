"use client";

import { useCapturePaymentMutation } from "@/business/api";
import type {
  CapturePaymentRequest,
  Payment,
} from "@/business/types/dto/payments.dto";

export interface UseCapturePaymentResult {
  capturePayment: (
    paymentId: string,
    body: CapturePaymentRequest,
    dealId?: string,
  ) => Promise<unknown>;
  payment: Payment | null;
  isCapturing: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset: () => void;
}

export function useCapturePayment(): UseCapturePaymentResult {
  const [capturePaymentMutation, { data, isLoading, isError, isSuccess, reset }] =
    useCapturePaymentMutation();

  return {
    capturePayment: (paymentId, body, dealId) =>
      capturePaymentMutation({ paymentId, body, dealId }),
    payment: data ?? null,
    isCapturing: isLoading,
    isError,
    isSuccess,
    reset,
  };
}
