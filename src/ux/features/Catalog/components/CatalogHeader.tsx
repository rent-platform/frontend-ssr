import styles from '../Catalog.module.scss';

type CatalogHeaderProps = {
  cityLabel: string;
};

export function CatalogHeader({ cityLabel }: CatalogHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <nav className={styles.topbarLinks}>
            <a href="#catalog">Для арендаторов</a>
            <a href="#catalog">Как это работает</a>
            <a href="#catalog">Помощь</a>
            <a href="#catalog">Каталог</a>
          </nav>

          <div className={styles.topbarActions}>
            <button type="button" className={styles.linkButton}>
              + Разместить объявление
            </button>
            <button type="button" className={styles.linkButton}>
              Мои объявления
            </button>
            <div className={styles.profileBadge}>
              <span>V</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.headerMain}>
        <div className={styles.brandBlock}>
          <div className={styles.brandLogo}>
            <span className={styles.logoBlue} />
            <span className={styles.logoGreen} />
            <span className={styles.logoRed} />
            <span className={styles.logoYellow} />
          </div>
          <div>
            <strong>Арендай</strong>
            <p>Аренда вещей по городу</p>
          </div>
        </div>

        <div className={styles.cityBadge}>📍 {cityLabel}</div>
      </div>
    </header>
  );
}
