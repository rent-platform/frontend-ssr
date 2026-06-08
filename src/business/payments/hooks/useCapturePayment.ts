"use client";

export function useCapturePayment() {
  return {
    capturePayment: async () => {
      throw new Error("Payment capture endpoint is not exposed by the current OpenAPI contract.");
    },
    payment: null,
    isCapturing: false,
    isError: false,
    captureError: null,
    isSuccess: false,
    reset: () => undefined,
  };
}
