'use client';

import clsx from 'clsx';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';

export { TableSkeleton } from '@/ux/components/TableSkeleton';

export function StatsSkeleton() {
  return (
    <div className={s.statsGrid}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={s.statCard}>
          <div className={clsx(s.skeleton)} style={{ width: 44, height: 44, borderRadius: 10 }} />
          <div style={{ flex: 1 }}>
            <div className={clsx(s.skeletonLine)} style={{ width: '60%', marginBottom: 6 }} />
            <div className={clsx(s.skeletonLine, s.skeletonSm)} />
          </div>
        </div>
      ))}
    </div>
  );
}
