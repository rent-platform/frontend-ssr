'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, X, Zap } from 'lucide-react';
import { ROUTES, useFocusTrap } from '@/ux/utils';
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
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Закрыть окно"
        >
          <X size={16} />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.modalIcon}>
            <Shield size={24} />
          </div>
          <h3 id="guest-auth-title">Создайте аккаунт</h3>
          <p className={styles.modalSubtitle}>
            Чтобы бронировать, писать владельцам и сохранять избранное
          </p>
        </div>

        <Link href={ROUTES.register} className={styles.modalPrimary}>
          Создать аккаунт
          <ArrowRight size={18} />
        </Link>

        <div className={styles.modalDivider}>
          <span>или</span>
        </div>

        <Link href={ROUTES.login} className={styles.modalSecondary}>
          У меня уже есть аккаунт
        </Link>

        <div className={styles.modalTrust}>
          <Zap size={13} />
          <span>Быстрая регистрация — меньше минуты</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
