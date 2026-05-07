'use client';

import { ShimmerBlock } from '@/ux/components';
import styles from '../PublicProfile.module.scss';

export function ProfileSkeleton() {
  const s = styles.shimmer;

  return (
    <div className={styles.page}>
      <div className={styles.skeletonHeader}>
        <ShimmerBlock className={s} w={140} h={28} r={8} />
        <div className={styles.skeletonHeaderSpacer} />
        <ShimmerBlock className={s} w={100} h={28} r={8} />
      </div>
      <div className={styles.skeletonBreadcrumb}>
        <ShimmerBlock className={s} w={200} h={16} r={4} />
      </div>
      <div className={styles.skeletonLayout}>
        <div className={styles.skeletonSidebar}>
          <div className={styles.skeletonCard}>
            <ShimmerBlock className={s} w={96} h={96} r="50%" />
            <ShimmerBlock className={s} w={160} h={20} r={6} mt={16} />
            <ShimmerBlock className={s} w={100} h={14} r={4} mt={8} />
            <ShimmerBlock className={s} w="100%" h={44} r={12} mt={20} />
          </div>
          <div className={styles.skeletonCard}>
            <ShimmerBlock className={s} w={140} h={16} r={4} />
            <ShimmerBlock className={s} w="100%" h={12} r={4} mt={12} />
            <ShimmerBlock className={s} w="80%" h={12} r={4} mt={8} />
            <ShimmerBlock className={s} w="60%" h={12} r={4} mt={8} />
          </div>
        </div>
        <div className={styles.skeletonMain}>
          <div className={styles.skeletonCardPadded}>
            <ShimmerBlock className={s} w={60} h={16} r={4} />
            <ShimmerBlock className={s} w="100%" h={14} r={4} mt={12} />
            <ShimmerBlock className={s} w="85%" h={14} r={4} mt={6} />
          </div>
          <div className={styles.skeletonStats}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonStatCard}>
                <ShimmerBlock className={s} w={40} h={24} r={4} />
                <ShimmerBlock className={s} w={80} h={10} r={3} mt={6} />
              </div>
            ))}
          </div>
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonListingCard}>
                <ShimmerBlock className={s} w="100%" aspect="4/3" r={0} />
                <div className={styles.skeletonListingBody}>
                  <ShimmerBlock className={s} w="90%" h={14} r={4} />
                  <ShimmerBlock className={s} w={50} h={10} r={3} mt={8} />
                  <ShimmerBlock className={s} w={80} h={18} r={4} mt={10} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
