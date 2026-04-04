import styles from '../Catalog.module.scss';

export function CatalogSkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonLineLg} />
      <div className={styles.skeletonLineMd} />
      <div className={styles.skeletonLineSm} />
      <div className={styles.skeletonTagRow}>
        <span />
        <span />
      </div>
    </div>
  );
}
