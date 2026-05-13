'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import styles from './AdminListingDetail.module.scss';

export function AdminGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className={styles.galleryEmpty}>
        <ImageIcon size={40} />
        <span>Нет фотографий</span>
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryMain}>
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={`${title} — фото ${active + 1}`}
            className={styles.galleryImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>
        <div className={styles.galleryCounter}>
          <ImageIcon size={14} />
          {active + 1} / {images.length}
        </div>
        {images.length > 1 && (
          <>
            <button
              className={clsx(styles.galleryNav, styles.galleryNavPrev)}
              onClick={() => setActive((p) => (p > 0 ? p - 1 : images.length - 1))}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className={clsx(styles.galleryNav, styles.galleryNavNext)}
              onClick={() => setActive((p) => (p < images.length - 1 ? p + 1 : 0))}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className={styles.galleryThumbs}>
          {images.map((src, i) => (
            <button
              key={i}
              className={clsx(styles.galleryThumb, i === active && styles.galleryThumbActive)}
              onClick={() => setActive(i)}
            >
              <img src={src} alt={`${title} — миниатюра ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
