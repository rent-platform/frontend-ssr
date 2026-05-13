'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useScrollToTop } from '@/ux/hooks/useScrollToTop';
import styles from './ScrollToTop.module.scss';

export type ScrollToTopProps = {
  /** Scroll threshold in px to show the button. Default 600. */
  threshold?: number;
  /** Extra CSS class for the button. */
  className?: string;
};

export function ScrollToTop({ threshold = 600, className }: ScrollToTopProps) {
  const { visible, scrollToTop } = useScrollToTop(threshold);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          className={className ?? styles.btn}
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          aria-label="Наверх"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
