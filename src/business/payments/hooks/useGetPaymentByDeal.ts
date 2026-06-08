"use client";

export function useGetPaymentByDeal() {
  return {
    payment: null,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: () => undefined,
  };
}
