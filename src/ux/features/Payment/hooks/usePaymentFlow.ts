'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useGetPaymentByDeal } from '@/business/payments/hooks';
import { useCreatePayment } from '@/business/payments/hooks';
import { useCancelPayment } from '@/business/payments/hooks';
import type { Payment, CreatePaymentRequest } from '@/business/payments/types/payments.dto';
import { getPaymentUiState, POLLING_INTERVAL_MS, POLLING_STATUSES } from '../paymentHelpers';
import type { PaymentUiState } from '../types';

export interface UsePaymentFlowResult {
  payment: Payment | null;
  uiState: PaymentUiState;
  isLoading: boolean;
  createPayment: (payload: CreatePaymentRequest) => Promise<unknown>;
  cancelPayment: (paymentId: string, dealId?: string) => Promise<unknown>;
  refetch: () => void;
  redirectToPayment: () => void;
}

export function usePaymentFlow(dealId: string): UsePaymentFlowResult {
  const {
    payment,
    isLoading,
    isError,
    refetch,
  } = useGetPaymentByDeal(dealId);

  const { createPayment } = useCreatePayment();
  const { cancelPayment } = useCancelPayment();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const shouldPoll =
      payment?.status && POLLING_STATUSES.includes(payment.status);

    if (shouldPoll) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, POLLING_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [payment?.status, refetch]);

  const uiState: PaymentUiState = getPaymentUiState(
    payment?.status ?? null,
    isError,
  );

  const redirectToPayment = useCallback(() => {
    if (payment?.confirmationUrl) {
      window.open(payment.confirmationUrl, '_blank', 'noopener,noreferrer');
    }
  }, [payment?.confirmationUrl]);

  return {
    payment,
    uiState,
    isLoading,
    createPayment,
    cancelPayment,
    refetch,
    redirectToPayment,
  };
}
