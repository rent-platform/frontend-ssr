'use client';

import clsx from 'clsx';
import styles from './EmptyState.module.scss';

export type EmptyStateSize = 'sm' | 'md' | 'lg';

export type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
  size?: EmptyStateSize;
  action?: React.ReactNode;
  className?: string;
};

const SIZE_MAP = {
  root: { sm: styles.rootSm, md: styles.rootMd, lg: styles.rootLg },
  icon: { sm: styles.iconSm, md: styles.iconMd, lg: styles.iconLg },
  title: { sm: styles.titleSm, md: styles.titleMd, lg: styles.titleLg },
} as const;

export function EmptyState({
  icon,
  title,
  text,
  size = 'md',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={clsx(styles.root, SIZE_MAP.root[size], className)}>
      <div className={clsx(styles.icon, SIZE_MAP.icon[size])}>{icon}</div>
      <h3 className={clsx(styles.title, SIZE_MAP.title[size])}>{title}</h3>
      <p className={styles.text}>{text}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
