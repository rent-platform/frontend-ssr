'use client';

import Link from 'next/link';
import { LayoutGrid, LogIn, UserPlus } from 'lucide-react';
import { BrandIcon } from '../../Catalog';
import { ROUTES } from '@/ux/utils';
import styles from '../GuestExperience.module.scss';

export function GuestHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <Link href={ROUTES.guest} className={styles.brandBlock}>
            <BrandIcon />
            <div className={styles.brandTextWrap}>
              <strong>Арендай</strong>
              <span className={styles.brandTagline}>Шеринг вещей</span>
            </div>
          </Link>

          <nav className={styles.mainNav} aria-label="Гостевая навигация">
            <a href="#guest-catalog" className={styles.navLinkActive}>
              <LayoutGrid size={18} />
              <span>Каталог</span>
            </a>
            <a href="#how-it-works" className={styles.navLink}>
              Как это работает
            </a>
            <Link href={ROUTES.safety} className={styles.navLink}>
              Безопасность
            </Link>
          </nav>
        </div>

        <div className={styles.authButtons}>
          <Link href={ROUTES.login} className={styles.loginBtn}>
            <LogIn size={18} />
            Войти
          </Link>
          <Link href={ROUTES.register} className={styles.registerBtn}>
            <UserPlus size={18} />
            Регистрация
          </Link>
        </div>
      </div>
    </header>
  );
}
