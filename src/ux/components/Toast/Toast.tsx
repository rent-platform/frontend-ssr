'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, Eye } from 'lucide-react';
import clsx from 'clsx';
import s from '../../layouts/AdminLayout/AdminLayout.module.scss';

export type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' };
export type ToastFn = (message: string, type?: Toast['type']) => void;

let toastSeq = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}

export function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className={s.toastContainer}>
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={clsx(
              s.toast,
              t.type === 'success' && s.toastSuccess,
              t.type === 'error' && s.toastError,
              t.type === 'info' && s.toastInfo,
            )}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
          >
            <div className={s.toastIcon}>
              {t.type === 'success' ? <Check size={14} /> : t.type === 'error' ? <X size={14} /> : <Eye size={14} />}
            </div>
            <span className={s.toastMessage}>{t.message}</span>
            <button className={s.toastClose} onClick={() => dismiss(t.id)}>
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
