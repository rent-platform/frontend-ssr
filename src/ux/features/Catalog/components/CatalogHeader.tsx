'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Bell, 
  MessageSquare, 
  Plus, 
  MapPin, 
  User,
  ChevronDown,
  LayoutGrid,
  LogOut,
  Settings,
} from 'lucide-react';
import styles from '../Catalog.module.scss';

type CatalogHeaderProps = {
  cityLabel: string;
  isHidden?: boolean;
  onBrandClick?: () => void;
};

export function BrandIcon() {
  return (
    <motion.div 
      className={styles.brandSymbol}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span style={{ fontSize: '20px', fontWeight: '800', lineHeight: 1 }}>А</span>
    </motion.div>
  );
}

const actionIcons = [
  { label: 'Избранное', count: 2, Icon: Heart, href: '/dev-ui/favorites' },
  { label: 'Уведомления', count: 5, Icon: Bell, href: '/dev-ui/notifications' },
  { label: 'Сообщения', count: 9, Icon: MessageSquare, href: '/dev-ui/chat' },
] as const;

export function CatalogHeader({ cityLabel, isHidden = false, onBrandClick }: CatalogHeaderProps) {
  const router = useRouter();

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBrandClick) onBrandClick();
    router.push('/dev-ui');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`${styles.header} ${isHidden ? styles.headerHidden : ''}`}>
        <div className={styles.topbarInner}>
          <div className={styles.headerLeft}>
            <Link href="/dev-ui" className={styles.brandBlock} aria-label="Перейти на главную Арендай" onClick={handleBrandClick}>
              <BrandIcon />
              <div className={styles.brandTextWrap}>
                <strong>Арендай</strong>
                <span className={styles.brandTagline}>Шеринг вещей</span>
              </div>
            </Link>

            <nav className={styles.mainNav}>
              <Link href="/dev-ui" className={styles.navLinkActive}>
                <LayoutGrid size={18} />
                <span>Каталог</span>
              </Link>
              <Link href="/how-it-works" className={styles.navLink}>
                Как это работает
              </Link>
              <Link href="/safety" className={styles.navLink}>
                Безопасность
              </Link>
            </nav>
          </div>

          <div className={styles.topbarActions}>
            <div className={styles.actionButtons}>
              <Link href="/dev-ui/create-listing" style={{ textDecoration: 'none' }}>
                <motion.button 
                  type="button" 
                  className={styles.btnSecondary}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  <Plus size={18} />
                  <span>Сдать в аренду</span>
                </motion.button>
              </Link>
            </div>

            <div className={styles.divider} />

            <div className={styles.iconActionRow}>
              {actionIcons.map(({ label, count, Icon, href }) => {
                const btn = (
                  <motion.button 
                    key={label} 
                    type="button" 
                    className={styles.iconAction} 
                    aria-label={label}
                    whileHover={{ y: -2, color: 'var(--color-primary)' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon size={20} className={styles.iconSvg} />
                    {count > 0 && (
                      <motion.span 
                        className={styles.iconBadge}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        {count}
                      </motion.span>
                    )}
                  </motion.button>
                );
                return href ? (
                  <Link key={label} href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {btn}
                  </Link>
                ) : (
                  <span key={label}>{btn}</span>
                );
              })}
            </div>

            <div className={styles.accountMeta}>
              <motion.div 
                className={styles.locationChip}
                whileHover={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}
              >
                <MapPin size={14} />
                <span>{cityLabel}</span>
              </motion.div>
              
              <div className={styles.profileDropdown}>
                <Link href="/dev-ui/profile" style={{ textDecoration: 'none' }}>
                  <motion.button 
                    type="button" 
                    className={styles.profileTrigger}
                    whileHover={{ y: -1, boxShadow: 'var(--shadow-md)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={styles.avatarWrap}>
                      <User size={18} />
                    </div>
                    <ChevronDown size={14} className={styles.chevron} />
                  </motion.button>
                </Link>

                <div className={styles.profileMenu}>
                  <Link href="/dev-ui/profile" className={styles.profileMenuItem}>
                    <User size={16} />
                    <span>Мой профиль</span>
                  </Link>
                  <Link href="/dev-ui/notifications" className={styles.profileMenuItem}>
                    <Bell size={16} />
                    <span>Уведомления</span>
                  </Link>
                  <Link href="/dev-ui/chat" className={styles.profileMenuItem}>
                    <MessageSquare size={16} />
                    <span>Сообщения</span>
                  </Link>
                  <Link href="/dev-ui/settings" className={styles.profileMenuItem}>
                    <Settings size={16} />
                    <span>Настройки</span>
                  </Link>
                  <div className={styles.profileMenuDivider} />
                  <button type="button" className={`${styles.profileMenuItem} ${styles.profileMenuLogout}`}>
                    <LogOut size={16} />
                    <span>Выйти</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </header>
  );
}
