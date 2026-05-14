'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, ChevronRight, Flag, Send, X } from 'lucide-react';
import { useFocusTrap } from '@/ux/hooks';
import { EASE } from '@/ux/utils';
import styles from '../PublicProfile.module.scss';

const REPORT_REASONS = [
  { id: 'fake', label: 'Фейковый профиль', desc: 'Поддельное фото или данные' },
  { id: 'scam', label: 'Мошенничество', desc: 'Попытка обмана или кражи' },
  { id: 'offensive', label: 'Оскорбительное поведение', desc: 'Грубость, угрозы, дискриминация' },
  { id: 'spam', label: 'Спам', desc: 'Нежелательные сообщения или реклама' },
  { id: 'other', label: 'Другая причина', desc: 'Опишите проблему своими словами' },
] as const;

type ReportModalProps = {
  userName: string;
  onClose: () => void;
  onSubmitted?: () => void;
};

export function ReportModal({ userName, onClose, onSubmitted }: ReportModalProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(true);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const canSubmit = selectedReason && (selectedReason !== 'other' || customText.trim().length > 0);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    setSubmitted(true);
    onSubmitted?.();
    setTimeout(onClose, 2000);
  }, [canSubmit, onClose, onSubmitted]);

  return (
    <motion.div
      className={styles.reportOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={trapRef}
        className={styles.reportPanel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              className={styles.reportSuccess}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <div className={styles.reportSuccessIcon}>
                <Check size={28} />
              </div>
              <h3>Жалоба отправлена</h3>
              <p>Спасибо за обращение. Мы рассмотрим вашу жалобу в ближайшее время.</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className={styles.reportHeader}>
                <div className={styles.reportHeaderIcon}>
                  <Flag size={18} />
                </div>
                <div>
                  <h3 id="report-modal-title">Пожаловаться</h3>
                  <p>на пользователя {userName}</p>
                </div>
                <button type="button" className={styles.reportClose} onClick={onClose}>
                  <X size={18} />
                </button>
              </div>

              <div className={styles.reportBody}>
                <span className={styles.reportLabel}>Выберите причину</span>
                <div className={styles.reportReasons}>
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason.id}
                      type="button"
                      className={`${styles.reportReason} ${selectedReason === reason.id ? styles.reportReasonActive : ''}`}
                      onClick={() => setSelectedReason(reason.id)}
                    >
                      <div className={styles.reportReasonRadio}>
                        {selectedReason === reason.id && <div className={styles.reportReasonDot} />}
                      </div>
                      <div className={styles.reportReasonText}>
                        <span className={styles.reportReasonLabel}>{reason.label}</span>
                        <span className={styles.reportReasonDesc}>{reason.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {(selectedReason === 'other' || (selectedReason && customText.length > 0)) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <textarea
                        className={styles.reportTextarea}
                        placeholder="Опишите проблему подробнее..."
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        rows={3}
                        maxLength={500}
                      />
                      <span className={styles.reportCharCount}>{customText.length}/500</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className={styles.reportFooter}>
                <button type="button" className={styles.reportCancel} onClick={onClose}>
                  Отмена
                </button>
                <button
                  type="button"
                  className={styles.reportSubmit}
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  <Send size={14} />
                  Отправить жалобу
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
