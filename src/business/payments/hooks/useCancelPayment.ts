"use client";

export function useCancelPayment() {
  return {
    cancelPayment: async () => {
      throw new Error("Payment cancellation endpoint is not exposed by the current OpenAPI contract.");
    },
    payment: null,
    isCancelling: false,
    isError: false,
    cancelError: null,
    isSuccess: false,
    reset: () => undefined,
  };
}
