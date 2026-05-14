'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import type { PaymentStatus } from '@/business/payments';
import type { PaymentPageProps } from './types';
import { getPaymentUiState } from './paymentHelpers';
import { usePaymentFlow } from './hooks/usePaymentFlow';
import { MOCK_PAYMENTS, MOCK_STATUS_OPTIONS } from './mockPaymentData';
import { PaymentStatusCard } from './components/PaymentStatusCard';
import { PaymentSummary } from './components/PaymentSummary';
import { PaymentActions } from './components/PaymentActions';
import { PaymentSkeleton } from './components/PaymentSkeleton';
import styles from './PaymentPage.module.scss';

export function PaymentPage({ dealId }: PaymentPageProps) {
  const flow = usePaymentFlow(dealId);

  const isDemo = !flow.payment && !flow.isLoading;
  const [demoStatus, setDemoStatus] = useState<PaymentStatus>('PENDING');
  const [showToast, setShowToast] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  const payment = isDemo ? MOCK_PAYMENTS[demoStatus] : flow.payment;
  const uiState = isDemo
    ? getPaymentUiState(demoStatus)
    : flow.uiState;

  useEffect(() => {
    const currentStatus = payment?.status ?? null;
    const prev = prevStatusRef.current;

    if (
      prev &&
      prev !== currentStatus &&
      (currentStatus === 'AUTHORIZED' || currentStatus === 'CAPTURED')
    ) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }

    prevStatusRef.current = currentStatus;
  }, [payment?.status]);

  const handlePay = useCallback(() => {
    if (isDemo) {
      window.open(MOCK_PAYMENTS.PENDING.confirmationUrl, '_blank', 'noopener,noreferrer');
    } else {
      flow.redirectToPayment();
    }
  }, [isDemo, flow]);

  const handleCancel = useCallback(() => {
    if (isDemo) {
      setDemoStatus('CANCELED');
    } else if (payment) {
      flow.cancelPayment(payment.paymentId, dealId);
    }
  }, [isDemo, payment, flow, dealId]);

  const handleRetry = useCallback(() => {
    if (isDemo) {
      setDemoStatus('PENDING');
    } else {
      flow.refetch();
    }
  }, [isDemo, flow]);

  const handleBack = useCallback(() => {
    window.history.back();
  }, []);

  if (flow.isLoading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={handleBack}>
            <ArrowLeft size={16} />
            Назад к сделке
          </button>
          <span className={styles.brand}>Арендай</span>
        </header>
        <main className={styles.content}>
          <PaymentSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={16} />
          Назад к сделке
        </button>
        <span className={styles.brand}>Арендай</span>
      </header>

      <main className={styles.content}>
        <div className={styles.card}>
          <PaymentStatusCard uiState={uiState} />

          {payment && (
            <PaymentSummary
              rentalAmount={payment.rentalAmount}
              depositAmount={payment.depositAmount}
              totalAmount={payment.totalAmount}
            />
          )}

          <PaymentActions
            uiState={uiState}
            hasConfirmationUrl={!!payment?.confirmationUrl}
            onPay={handlePay}
            onCancel={handleCancel}
            onRetry={handleRetry}
            onBack={handleBack}
          />
        </div>

        {isDemo && (
          <div className={styles.demoSwitcher}>
            <span className={styles.demoSwitcherLabel}>Demo: переключение статусов</span>
            <div className={styles.demoSwitcherButtons}>
              {MOCK_STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={clsx(
                    styles.demoBtn,
                    demoStatus === opt.value && styles.demoBtnActive,
                  )}
                  onClick={() => setDemoStatus(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {showToast && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
          >
            <CheckCircle size={18} />
            Оплата прошла успешно
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
