'use client';

import { ShimmerBlock } from '@/ux/components';
import styles from '../ProfileDashboard.module.scss';

export function DashboardSkeleton() {
  const s = styles.shimmer;

  return (
    <div className={styles.page}>
      <div className={styles.skeletonBar}>
        <ShimmerBlock className={s} w={140} h={24} r={6} />
      </div>
      <div className={styles.skeletonWrap}>
        {/* Profile card */}
        <div className={styles.skeletonCard}>
          <div className={styles.skeletonUserRow}>
            <ShimmerBlock className={s} w={88} h={88} r="50%" />
            <div className={styles.skeletonUserInfo}>
              <ShimmerBlock className={s} w={200} h={22} r={6} />
              <ShimmerBlock className={s} w={100} h={14} r={4} mt={8} />
              <ShimmerBlock className={s} w={300} h={13} r={4} mt={10} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <ShimmerBlock className={s} w={90} h={28} r={14} />
                <ShimmerBlock className={s} w={110} h={28} r={14} />
                <ShimmerBlock className={s} w={120} h={28} r={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className={styles.skeletonStatsRow}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonStatCell}>
              <ShimmerBlock className={s} w={44} h={44} r={12} />
              <div>
                <ShimmerBlock className={s} w={36} h={20} r={4} />
                <ShimmerBlock className={s} w={56} h={10} r={3} mt={4} />
              </div>
            </div>
          ))}
        </div>

        {/* Earnings row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <ShimmerBlock key={i} className={s} h={68} r={16} />
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <ShimmerBlock key={i} className={s} h={72} r={16} />
          ))}
        </div>

        {/* Tab bar */}
        <ShimmerBlock className={s} w="100%" h={48} r={14} />

        {/* Content panel */}
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
