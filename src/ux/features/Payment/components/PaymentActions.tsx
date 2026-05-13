'use client';

import { motion } from 'framer-motion';
import { CreditCard, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import styles from '../PaymentPage.module.scss';
import type { PaymentUiState } from '../types';

interface PaymentActionsProps {
  uiState: PaymentUiState;
  hasConfirmationUrl: boolean;
  onPay: () => void;
  onCancel: () => void;
  onRetry: () => void;
  onBack: () => void;
  isProcessing?: boolean;
}

export function PaymentActions({
  uiState,
  hasConfirmationUrl,
  onPay,
  onCancel,
  onRetry,
  onBack,
  isProcessing,
}: PaymentActionsProps) {
  const showPayButton = uiState.status === 'pending' && hasConfirmationUrl;
  const showRetryButton = uiState.canRetry;
  const showCancelButton = uiState.canCancel;
  const isTerminal = uiState.status === 'captured' || uiState.status === 'refunded';

  return (
    <motion.div
      className={styles.actions}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {showPayButton && (
        <button
          className={styles.btnPrimary}
          onClick={onPay}
          disabled={isProcessing}
        >
          <CreditCard size={18} />
          Оплатить через ЮKassa
        </button>
      )}

      {showRetryButton && (
        <button
          className={styles.btnPrimary}
          onClick={onRetry}
          disabled={isProcessing}
        >
          <RotateCcw size={18} />
          Повторить оплату
        </button>
      )}

      {showCancelButton && (
        <button
          className={styles.btnDanger}
          onClick={onCancel}
          disabled={isProcessing}
        >
          <XCircle size={18} />
          Отменить платёж
        </button>
      )}

      {isTerminal && (
        <button className={styles.btnSecondary} onClick={onBack}>
          <ArrowLeft size={18} />
          Вернуться к сделке
        </button>
      )}
    </motion.div>
  );
}
