"use client";

export function useGetPaymentById() {
  return {
    payment: null,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: () => undefined,
  };
}
