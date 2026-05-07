'use client';

import { ShimmerBlock } from '@/ux/components';
import styles from '../ProfileDashboard.module.scss';

export function DashboardSkeleton() {
  const s = styles.shimmer;

  return (
    <div className={styles.page}>
      <div className={styles.skeletonBar}><ShimmerBlock className={s} w={140} h={24} r={6} /></div>
      <div className={styles.skeletonWrap}>
        <div className={styles.skeletonCard}>
          <div className={styles.skeletonUserRow}>
            <ShimmerBlock className={s} w={64} h={64} r="50%" />
            <div className={styles.skeletonUserInfo}>
              <ShimmerBlock className={s} w={180} h={20} r={6} />
              <ShimmerBlock className={s} w={260} h={13} r={4} mt={10} />
              <ShimmerBlock className={s} w={200} h={13} r={4} mt={8} />
            </div>
          </div>
          <div className={styles.skeletonStatsRow}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonStatCell}>
                <ShimmerBlock className={s} w={32} h={20} r={4} />
                <ShimmerBlock className={s} w={48} h={10} r={3} />
              </div>
            ))}
          </div>
        </div>
        <ShimmerBlock className={s} w="100%" h={44} r={0} />
        <div className={styles.skeletonCardPadded}>
          <ShimmerBlock className={s} w={140} h={18} r={5} />
          <div className={styles.skeletonListingGrid}>
            {[1, 2, 3].map((i) => <ShimmerBlock key={i} className={s} h={72} r={12} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
