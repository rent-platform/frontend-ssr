'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  Package,
  Share2,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react';
import type { CatalogUiItem } from '../../types';
import {
  formatCatalogCardLocation,
  formatRelativeDate,
} from '../../utils';
import { CatalogCard } from '../cards/CatalogCard';
import { ProductGallery } from './ProductGallery';
import { BookingSidebar } from './BookingSidebar';
import styles from '../../Catalog.module.scss';

type ProductDetailProps = {
  item: CatalogUiItem;
  similarItems: CatalogUiItem[];
  onBack: () => void;
  onOpenSimilar: (item: CatalogUiItem) => void;
  isGuest?: boolean;
  onAuthRequired?: () => void;
};

export function ProductDetail({
  item,
  similarItems,
  onBack,
  onOpenSimilar,
  isGuest = false,
  onAuthRequired,
}: ProductDetailProps) {
  const [isFav, setIsFav] = useState(false);

  const locationLabel = formatCatalogCardLocation(item);
  const publishedLabel = formatRelativeDate(item.createdAt);

  const handleFavoriteToggle = useCallback(() => {
    if (isGuest) {
      onAuthRequired?.();
      return;
    }
    setIsFav((v) => !v);
  }, [isGuest, onAuthRequired]);

  return (
    <motion.div
      className={styles.detailPage}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <div className={styles.detailContentMain}>

        {/* ─── Back Bar ─── */}
        <nav className={styles.backBar}>
          <button type="button" onClick={onBack} className={styles.backButton}>
            <ArrowLeft size={16} />
            <span>К каталогу</span>
          </button>
          <div className={styles.detailActions}>
            <button type="button" className={styles.detailActionBtn}>
              <Share2 size={16} /> Поделиться
            </button>
            <button
              type="button"
              className={clsx(styles.detailActionBtn, styles.detailActionBtnDanger)}
              onClick={handleFavoriteToggle}
            >
              <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
              {isFav ? 'В избранном' : 'Сохранить'}
            </button>
          </div>
        </nav>

        {/* ─── Gallery ─── */}
        <ProductGallery item={item} />

        {/* ─── Header ─── */}
        <motion.section
          className={styles.detailHeader}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.detailMetaTop}>
            <div className={styles.detailRating}>
              <Star size={16} />
              {(item.ownerRating ?? 0).toFixed(1)}
            </div>
            <span className={styles.detailMetaDot} />
            <div className={styles.detailLocation}>
              <MapPin size={15} />
              {locationLabel}
            </div>
          </div>

          <h1>{item.title}</h1>

          {(item.tags ?? []).length > 0 && (
            <div className={styles.detailTags}>
              {(item.tags ?? []).map((tag: string) => (
                <span key={tag} className={styles.detailTag}>{tag}</span>
              ))}
            </div>
          )}
        </motion.section>

        {/* ─── Trust Indicators ─── */}
        <section className={styles.detailTrustRow}>
          <div className={styles.detailTrustItem}>
            <Clock3 size={20} />
            <div>
              <span>Опубликовано</span>
              <strong>{publishedLabel}</strong>
            </div>
          </div>
          <div className={styles.detailTrustItem}>
            <Truck size={20} />
            <div>
              <span>Доставка</span>
              <strong>Есть / Самовывоз</strong>
            </div>
          </div>
        </section>

        {/* ─── Specs Grid ─── */}
        {(item.specs ?? []).length > 0 && (
          <motion.section
            className={styles.detailSpecsSection}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.detailSectionHeader}>
              <h2>Характеристики</h2>
            </div>
            <div className={styles.detailSpecsGrid}>
              {(item.specs ?? []).map((spec: { label: string; value: string }, i: number) => (
                <div key={i} className={styles.detailSpecItem}>
                  <div className={styles.specIcon}>
                    <Package size={18} />
                  </div>
                  <div className={styles.specContent}>
                    <span>{spec.label}</span>
                    <span>{spec.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ─── Description ─── */}
        <motion.section
          className={styles.detailDescription}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className={styles.detailSectionHeader}>
            <h2>Описание</h2>
          </div>
          <div className={styles.detailParagraphs}>
            {(item.description ?? []).map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </motion.section>

        {/* ─── Guarantee Banner ─── */}
        <section className={styles.guaranteeBanner}>
          <div className={styles.guaranteeIcon}>
            <ShieldCheck size={26} />
          </div>
          <div className={styles.guaranteeText}>
            <strong>Защита арендатора</strong>
            <span>
              Каждая сделка защищена платформой. Если товар не соответствует
              описанию — мы вернём деньги в течение 24 часов.
            </span>
          </div>
        </section>

        {/* ─── Similar Items ─── */}
        {similarItems.length > 0 && (
          <section className={styles.similarSection}>
            <div className={styles.sectionHeader}>
              <h2>Похожие предложения</h2>
              <button type="button" className={styles.viewAllLink}>
                Смотреть все <ChevronRight size={16} />
              </button>
            </div>
            <div className={styles.similarGrid}>
              {similarItems.slice(0, 3).map((sim, i) => (
                <CatalogCard key={sim.id} item={sim} index={i} onOpen={onOpenSimilar} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ═══════ Sidebar ═══════ */}
      <BookingSidebar item={item} isGuest={isGuest} onAuthRequired={onAuthRequired} />
    </motion.div>
  );
}