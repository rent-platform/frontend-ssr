'use client';

import type { UiDealStatus } from '@/ux/types/deal';
import styles from '../DealDetailsPage.module.scss';

interface DealReasonBlockProps {
  status: UiDealStatus;
  rejectionReason?: string;
  cancellationReason?: string;
}

export function DealReasonBlock({ status, rejectionReason, cancellationReason }: DealReasonBlockProps) {
  if (status === 'REJECTED' && rejectionReason) {
    return (
      <div className={styles.reasonBlock}>
        <p className={styles.reasonTitle}>Причина отклонения</p>
        <p className={styles.reasonText}>{rejectionReason}</p>
      </div>
    );
  }

  if (status === 'CANCELLED' && cancellationReason) {
    return (
      <div className={styles.reasonBlock}>
        <p className={styles.reasonTitle}>Причина отмены</p>
        <p className={styles.reasonText}>{cancellationReason}</p>
      </div>
    );
  }

  return null;
}
