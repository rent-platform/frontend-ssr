'use client';

import styles from '../PaymentPage.module.scss';

export function PaymentSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.skeletonBlock} style={{ padding: '32px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <div className={styles.skeletonLine} style={{ width: 72, height: 72, borderRadius: '50%' }} />
          <div className={styles.skeletonLine} style={{ width: 200, height: 24 }} />
          <div className={styles.skeletonLine} style={{ width: 280, height: 16 }} />
        </div>
      </div>

      <div className={styles.skeletonBlock} style={{ padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={styles.skeletonLine} style={{ width: 80, height: 16 }} />
            <div className={styles.skeletonLine} style={{ width: 100, height: 16 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={styles.skeletonLine} style={{ width: 60, height: 16 }} />
            <div className={styles.skeletonLine} style={{ width: 100, height: 16 }} />
          </div>
          <div className={styles.skeletonLine} style={{ width: '100%', height: 1 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={styles.skeletonLine} style={{ width: 60, height: 20 }} />
            <div className={styles.skeletonLine} style={{ width: 120, height: 20 }} />
          </div>
        </div>
      </div>

      <div className={styles.skeletonBlock} style={{ padding: 24 }}>
        <div className={styles.skeletonLine} style={{ width: '100%', height: 48, borderRadius: 14 }} />
      </div>
    </div>
  );
}
