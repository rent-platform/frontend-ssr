'use client';

import clsx from 'clsx';
import s from '../../layouts/AdminLayout/AdminLayout.module.scss';

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className={s.card}>
      <div className={s.cardBody}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
            <div className={s.skeleton} style={{ width: 40, height: 40, borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <div className={clsx(s.skeletonLine, s.skeletonMd)} style={{ marginBottom: 6 }} />
              <div className={clsx(s.skeletonLine, s.skeletonSm)} />
            </div>
            <div className={s.skeletonLine} style={{ width: 80 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
