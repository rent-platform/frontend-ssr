import Link from 'next/link';
import styles from '../Catalog.module.scss';

type CatalogHeaderProps = {
  cityLabel: string;
};

type IconProps = {
  className?: string;
};

type BrandIconProps = {
  className?: string;
};

function HeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M12 20.2 4.95 13.3A4.95 4.95 0 0 1 12 6.5a4.95 4.95 0 0 1 7.05 6.8L12 20.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M7.2 9.6a4.8 4.8 0 1 1 9.6 0v2.5c0 1 .36 1.97 1.01 2.74l.79.94H5.4l.8-.94A4.23 4.23 0 0 0 7.2 12.1V9.6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 18a2 2 0 0 0 4 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M6 7.5A3.5 3.5 0 0 1 9.5 4h5A3.5 3.5 0 0 1 18 7.5v4A3.5 3.5 0 0 1 14.5 15H11l-4 3v-3.4A3.47 3.47 0 0 1 6 11.5v-4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M4 5h2.1c.46 0 .85.32.96.77L7.6 8h11.27c.64 0 1.1.62.9 1.23l-1.4 4.34a1 1 0 0 1-.95.69H9.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="18" r="1.6" fill="currentColor" />
      <circle cx="17" cy="18" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function BrandIcon({ className }: BrandIconProps) {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" className={className ?? styles.brandSymbol}>
      <defs>
        <linearGradient id="brandGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#16d57c" />
          <stop offset="100%" stopColor="#0ea764" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="36" height="36" rx="14" fill="url(#brandGradient)" />
      <path
        d="M14 28.5 22.4 12h1.3L32 28.5h-5l-1.4-3.3h-6.9l-1.4 3.3H14Zm6.5-7.2h3.7l-1.8-4.4-1.9 4.4Z"
        fill="#fff"
      />
    </svg>
  );
}

const actionIcons = [
  { label: 'Избранное', count: 2, Icon: HeartIcon },
  { label: 'Уведомления', count: 5, Icon: BellIcon },
  { label: 'Сообщения', count: 9, Icon: ChatIcon },
  { label: 'Корзина', count: 1, Icon: CartIcon },
] as const;

export function CatalogHeader({ cityLabel }: CatalogHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <Link href="/" className={styles.brandBlock} aria-label="Перейти на главную Арендай">
            <BrandIcon />
            <div className={styles.brandTextWrap}>
              <strong>Арендай</strong>
              <span>Каталог аренды вещей по городам России</span>
            </div>
          </Link>

          <div className={styles.topbarActions}>
            <div className={styles.topbarLead}>
              <button type="button" className={styles.linkButtonSecondary}>
                Мои объявления
              </button>
              <button type="button" className={styles.linkButton}>
                + Разместить объявление
              </button>
            </div>

            <div className={styles.iconActionRow}>
              {actionIcons.map(({ label, count, Icon }) => (
                <button key={label} type="button" className={styles.iconAction} aria-label={label}>
                  <Icon className={styles.iconSvg} />
                  {count > 0 ? <span className={styles.iconBadge}>{count}</span> : null}
                </button>
              ))}
            </div>

            <div className={styles.accountMeta}>
              <div className={styles.cityBadge}>📍 {cityLabel}</div>
              <button type="button" className={styles.profileBadge} aria-label="Профиль Владислава">
                V
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.headerMain}>
        <div className={styles.headerCaption}>
          <span>Выбирайте вещь, бронируйте срок, пользуйтесь! </span>
        </div>
      </div>
    </header>
  );
}
