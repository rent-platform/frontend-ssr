'use client';

import clsx from 'clsx';
import styles from '../ProfileDashboard.module.scss';

export type VerifyChipProps = {
  icon: React.ReactNode;
  label: string;
  done: boolean;
  tooltip: string;
};

export function VerifyChip({ icon, label, done, tooltip }: VerifyChipProps) {
  return (
    <span className={clsx(styles.verifyChip, done ? styles.verifyDone : styles.verifyPending, styles.tooltipWrap)}>
      {icon} {label}
      <span className={styles.tooltipBubble}>{tooltip}</span>
    </span>
  );
}
