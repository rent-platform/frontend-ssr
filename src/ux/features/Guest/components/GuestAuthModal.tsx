'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, LogIn, UserPlus, X } from 'lucide-react';
import { ROUTES, useFocusTrap } from '@/ux/utils';
import { GUEST_LIMITS } from '../guestConstants';
import styles from '../GuestExperience.module.scss';

type GuestAuthModalProps = {
  onClose: () => void;
};

export function GuestAuthModal({ onClose }: GuestAuthModalProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(true);

  return (
    <motion.div
      className={styles.modal}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={trapRef}
        className={styles.modalContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-auth-title"
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Закрыть окно"
        >
          <X size={18} />
        </button>

        <div className={styles.modalIcon}>
          <Lock size={26} />
        </div>

        <h3 id="guest-auth-title">Войдите, чтобы продолжить</h3>
        <p>
          Каталог доступен без регистрации. Для бронирования, контактов
          владельца и чата нужен аккаунт — это бесплатно.
        </p>

        <div className={styles.modalLimits}>
          {GUEST_LIMITS.map((item) => (
            <span key={item}>
              <CheckCircle2 size={15} />
              {item}
            </span>
          ))}
        </div>

        <div className={styles.modalButtons}>
          <Link href={ROUTES.register} className={styles.modalPrimary}>
            <UserPlus size={18} />
            Создать аккаунт
          </Link>
          <Link href={ROUTES.login} className={styles.modalSecondary}>
            <LogIn size={18} />
            Войти
          </Link>
        </div>

        <p className={styles.modalFootnote}>
          Регистрация займёт меньше минуты
        </p>
      </motion.div>
    </motion.div>
  );
}
