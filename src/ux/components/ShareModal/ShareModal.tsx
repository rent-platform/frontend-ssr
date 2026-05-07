'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, X } from 'lucide-react';
import { useFocusTrap, EASE } from '@/ux/utils';
import styles from './ShareModal.module.scss';

type ShareModalProps = {
  url: string;
  title?: string;
  description?: string;
  onClose: () => void;
};

export function ShareModal({
  url,
  title = 'Поделиться профилем',
  description = 'Скопируйте ссылку и поделитесь с друзьями',
  onClose,
}: ShareModalProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  }, [url]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      className={styles.modalOverlay}
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
        aria-labelledby="share-modal-title"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 id="share-modal-title">{title}</h3>
          <button type="button" className={styles.modalClose} onClick={onClose}><X size={18} /></button>
        </div>
        <p className={styles.modalDesc}>{description}</p>
        <div className={styles.modalCopyRow}>
          <input type="text" readOnly value={url} className={styles.modalInput} />
          <button type="button" className={styles.modalCopyBtn} onClick={handleCopy}>
            {copied ? <><Check size={14} /> Скопировано</> : <><Copy size={14} /> Копировать</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
