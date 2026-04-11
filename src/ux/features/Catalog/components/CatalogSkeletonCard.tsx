import styles from './CatalogSkeletonCard.module.scss';

export function CatalogSkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonMeta}>
          <div className={styles.skeletonLineSm} />
          <div className={styles.skeletonRating} />
        </div>
        <div className={styles.skeletonLineLg} />
        <div className={styles.skeletonPriceRow}>
          <div className={styles.skeletonPrice} />
          <div className={styles.skeletonDeposit} />
        </div>
        <div className={styles.skeletonFooter}>
          <div className={styles.skeletonLocation} />
          <div className={styles.skeletonDate} />
        </div>
      </div>
    </div>
  );
}
