'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CatalogUiItem } from '../types';
import styles from '../Catalog.module.scss';

type ProductGalleryProps = {
  item: CatalogUiItem;
};

export function ProductGallery({ item }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);

  const canPrev = activeImage > 0;
  const canNext = activeImage < item.images.length - 1;

  const goPrev = useCallback(() => {
    if (canPrev) setActiveImage((i) => i - 1);
  }, [canPrev]);

  const goNext = useCallback(() => {
    if (canNext) setActiveImage((i) => i + 1);
  }, [canNext]);

  return (
    <section className={styles.detailGallery}>
      <div className={styles.mainImageWrap}>
        <img
          src={item.images[activeImage]}
          aria-hidden="true"
          className={styles.detailMainImageBlur}
        />
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={item.images[activeImage]}
            alt={item.title}
            className={styles.detailMainImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>

        {/* Arrow Navigation */}
        <div className={styles.galleryNav}>
          <button
            type="button"
            className={styles.galleryNavBtn}
            onClick={goPrev}
            disabled={!canPrev}
            aria-label="Предыдущее фото"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className={styles.galleryNavBtn}
            onClick={goNext}
            disabled={!canNext}
            aria-label="Следующее фото"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className={styles.detailGalleryOverlay}>
          <div className={styles.detailGalleryBadges}>
            <span className={styles.detailCategory}>{item.category}</span>
            {item.featured && <span className={styles.detailFeaturedBadge}>Топ выбор</span>}
          </div>
          <span className={styles.detailImageCounter}>
            {activeImage + 1} / {item.images.length}
          </span>
        </div>
      </div>

      {item.images.length > 1 && (
        <div className={styles.detailThumbs}>
          {item.images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={clsx(styles.detailThumb, idx === activeImage && styles.detailThumbActive)}
              onClick={() => setActiveImage(idx)}
            >
              <img src={img} alt={`${item.title} — фото ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
