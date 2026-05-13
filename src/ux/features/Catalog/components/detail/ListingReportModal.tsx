import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Flag,
  ImageOff,
  Scale,
  ShieldAlert,
  X,
} from 'lucide-react';
import styles from '../../Catalog.module.scss';

const REPORT_REASONS = [
  { id: 'fake', icon: ShieldAlert, label: 'Мошенничество' },
  { id: 'wrong-info', icon: AlertTriangle, label: 'Неверное описание или цена' },
  { id: 'bad-photos', icon: ImageOff, label: 'Фото не соответствуют товару' },
  { id: 'prohibited', icon: Ban, label: 'Запрещённый товар' },
  { id: 'duplicate', icon: Scale, label: 'Дубликат объявления' },
] as const;

export type ListingReportModalProps = {
  reportDone: boolean;
  onClose: () => void;
  onReported: () => void;
};

export function ListingReportModal({ reportDone, onClose, onReported }: ListingReportModalProps) {
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleReport = useCallback((_reasonId: string) => {
    setReportSent(true);
    setTimeout(() => {
      onClose();
      setReportSent(false);
      onReported();
    }, 1500);
  }, [onClose, onReported]);

  return (
    <motion.div
      className={styles.reportOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        className={styles.reportModal}
        role="dialog"
        aria-modal="true"
        aria-label="Жалоба на объявление"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {reportDone ? (
            <motion.div
              key="already"
              className={styles.reportModalSuccess}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className={styles.reportSuccessIcon}>
                <CheckCircle2 size={36} />
              </div>
              <h3>Жалоба уже отправлена</h3>
              <p>Вы уже отправили жалобу на это объявление</p>
              <button
                type="button"
                className={styles.reportModalOkBtn}
                onClick={onClose}
              >
                Понятно
              </button>
            </motion.div>
          ) : reportSent ? (
            <motion.div
              key="success"
              className={styles.reportModalSuccess}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className={styles.reportSuccessIcon}>
                <CheckCircle2 size={36} />
              </div>
              <h3>Жалоба отправлена</h3>
              <p>Спасибо, мы рассмотрим вашу жалобу</p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className={styles.reportModalHeader}>
                <div className={styles.reportModalIconWrap}>
                  <Flag size={20} />
                </div>
                <div>
                  <h3>Пожаловаться</h3>
                  <p>Укажите причину жалобы на это объявление</p>
                </div>
                <button
                  type="button"
                  className={styles.reportModalClose}
                  onClick={onClose}
                  aria-label="Закрыть"
                >
                  <X size={18} />
                </button>
              </div>
              <div className={styles.reportModalList}>
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    type="button"
                    className={styles.reportMenuItem}
                    onClick={() => handleReport(reason.id)}
                  >
                    <div className={styles.reportMenuItemIcon}>
                      <reason.icon size={18} />
                    </div>
                    {reason.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
