'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import styles from './BackLink.module.scss';

export type BackLinkProps = {
  href: string;
  label: string;
  className?: string;
  noMargin?: boolean;
};

export function BackLink({ href, label, className, noMargin }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={clsx(styles.backLink, noMargin && styles.noMargin, className)}
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
    </Link>
  );
}
