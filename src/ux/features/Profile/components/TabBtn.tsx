'use client';

import clsx from 'clsx';
import styles from '../ProfileDashboard.module.scss';

export type TabBtnProps = {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
  tooltip?: string;
};

export function TabBtn({ active, label, count, onClick, tooltip }: TabBtnProps) {
  return (
    <button type="button" className={clsx(styles.tab, active && styles.tabActive, tooltip && styles.tooltipWrap)} onClick={onClick}>
      {label}
      {count !== undefined && <span className={styles.tabCount}>{count}</span>}
      {tooltip && <span className={styles.tooltipBubble}>{tooltip}</span>}
    </button>
  );
}
