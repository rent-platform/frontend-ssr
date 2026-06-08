import { CatalogHeader, CatalogFooter } from "@/ux/features/Catalog";
import styles from "@/ux/features/Catalog/Catalog.module.scss";

export default function Loading() {
  return (
    <div className={styles.page}>
      <CatalogHeader cityLabel="Новосибирск" />
      <main className={styles.main}>
        <div className={styles.loadingShell}>
          <div className={styles.loadingHero} />
        </div>
      </main>
      <CatalogFooter />
    </div>
  );
}
