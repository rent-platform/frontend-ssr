'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CatalogFooter } from '../Catalog';
import { ROUTES } from '@/ux/utils';
import styles from './InfoPage.module.scss';
import type { PropsWithChildren } from 'react';

type InfoPageLayoutProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
}>;

export function InfoPageLayout({ eyebrow, title, subtitle, children }: InfoPageLayoutProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href={ROUTES.home} className={styles.brand}>
            <div className={styles.brandLogo}>А</div>
            <strong>Арендай</strong>
          </Link>
          <Link href={ROUTES.home} className={styles.backLink}>
            <ArrowLeft size={15} />
            Вернуться
          </Link>
        </div>
      </header>

      <section className={styles.hero}>
        {eyebrow && <div className={styles.heroEyebrow}>{eyebrow}</div>}
        <h1 className={styles.heroTitle}>{title}</h1>
        {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
      </section>

      <div className={styles.content}>{children}</div>

      <CatalogFooter />
    </div>
  );
}
