'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import type { PaymentUiState } from '../types';
import styles from '../PaymentPage.module.scss';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Clock,
  ShieldCheck,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
};

interface PaymentStatusCardProps {
  uiState: PaymentUiState;
}

export function PaymentStatusCard({ uiState }: PaymentStatusCardProps) {
  const IconComponent = ICON_MAP[uiState.icon] ?? AlertTriangle;
  const isPending = uiState.status === 'pending';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={uiState.status}
        className={styles.statusCard}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        layout
      >
        <div
          className={clsx(
            styles.statusIconWrap,
            styles[`statusIconWrap--${uiState.color}`],
            isPending && styles.pulse,
          )}
        >
          <IconComponent size={32} />
        </div>

        <h2 className={styles.statusLabel}>{uiState.label}</h2>
        <p className={styles.statusDescription}>{uiState.description}</p>
      </motion.div>
    </AnimatePresence>
  );
}
