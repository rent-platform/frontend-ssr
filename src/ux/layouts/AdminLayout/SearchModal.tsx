'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import s from './AdminLayout.module.scss';
import type { NavItem } from './types';

type SearchModalProps = {
  open: boolean;
  query: string;
  results: NavItem[];
  onClose: () => void;
  onQueryChange: (q: string) => void;
  onNavClick?: (key: string) => void;
};

export function SearchModal({
  open,
  query,
  results,
  onClose,
  onQueryChange,
  onNavClick,
}: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={s.searchModalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={s.searchModal}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={s.searchModalInput}>
              <Search size={18} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Поиск по разделам..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
              />
              <kbd className={s.kbdHint}>Esc</kbd>
            </div>
            <div className={s.searchModalResults}>
              {results.length === 0 ? (
                <div className={s.searchModalEmpty}>Ничего не найдено</div>
              ) : (
                results.map((item) => {
                  const Icon = item.icon;
                  if (onNavClick) {
                    return (
                      <button
                        key={item.key}
                        className={s.searchModalItem}
                        onClick={() => { onNavClick(item.key); onClose(); }}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={s.searchModalItem}
                      onClick={onClose}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
