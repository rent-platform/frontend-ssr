'use client';

import { motion } from 'framer-motion';
import { formatPaymentAmount } from '../paymentHelpers';
import styles from '../PaymentPage.module.scss';

interface PaymentSummaryProps {
  rentalAmount: number;
  depositAmount: number;
  totalAmount: number;
}

export function PaymentSummary({ rentalAmount, depositAmount, totalAmount }: PaymentSummaryProps) {
  return (
    <motion.div
      className={styles.summary}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Аренда</span>
        <span className={styles.summaryValue}>{formatPaymentAmount(rentalAmount)}</span>
      </div>

      <div className={styles.summaryRow}>
        <span className={styles.summaryLabel}>Залог</span>
        <span className={styles.summaryValue}>{formatPaymentAmount(depositAmount)}</span>
      </div>

      <hr className={styles.summaryDivider} />

      <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
        <span className={styles.summaryLabel}>Итого</span>
        <span className={styles.summaryValue}>{formatPaymentAmount(totalAmount)}</span>
      </div>
    </motion.div>
  );
}
