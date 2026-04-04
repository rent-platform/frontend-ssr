import styles from "./CatalogSkeletonCard.module.scss";

export function CatalogSkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.media} />
      <div className={styles.body}>
        <div className={styles.lineShort} />
        <div className={styles.lineTitle} />
        <div className={styles.lineTitleSmall} />
        <div className={styles.lineText} />
        <div className={styles.lineText} />
        <div className={styles.tags}>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.priceBox}>
          <div className={styles.lineShort} />
          <div className={styles.linePrice} />
          <div className={styles.lineText} />
        </div>
        <div className={styles.actions}>
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
