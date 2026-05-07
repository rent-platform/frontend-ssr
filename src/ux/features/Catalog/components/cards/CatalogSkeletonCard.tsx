import clsx from 'clsx';
import styles from './CatalogSkeletonCard.module.scss';

export function CatalogSkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonBody}>
        <div className={clsx(styles.skeletonLine, styles.skeletonLineTitle)} />
        <div className={clsx(styles.skeletonLine, styles.skeletonLineMedium)} />
        <div className={clsx(styles.skeletonLine, styles.skeletonLineShort)} />
      </div>
    </div>
  );
}
