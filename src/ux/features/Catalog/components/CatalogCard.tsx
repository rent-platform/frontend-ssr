import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import type { CatalogUiItem } from '../types';
import {
  formatCatalogCardHourSecondary,
  formatCatalogCardLocation,
  formatCatalogCardPrimaryPrice,
  formatDepositAmount,
  formatRelativeDate,
} from '../utils';
import styles from './CatalogCard.module.scss';

type CatalogCardProps = {
  item: CatalogUiItem;
  onOpen?: (item: CatalogUiItem) => void;
  index?: number;
  initialFavorite?: boolean;
  onFavoriteChange?: (id: string, value: boolean) => void;
};

const highlightVisuals = {
  'С доставкой': Truck,
  'Рядом сегодня': Zap,
  'Без залога': ShieldCheck,
  'Топ-рейтинг': Star,
  Новинки: Sparkles,
} as const;

/* ─── Mini Image Carousel ─── */
function ImageCarousel({
  images,
  alt,
  onImageClick,
}: {
  images: string[];
  alt: string;
  onImageClick: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const count = images.length;
  const hasMultiple = count > 1;

  const goTo = useCallback(
    (idx: number) => setCurrent((idx + count) % count),
    [count],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
  };

  return (
    <div
      className={styles.carousel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={current}
          src={images[current]}
          alt={`${alt} — фото ${current + 1}`}
          className={styles.carouselImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onImageClick}
          draggable={false}
        />
      </AnimatePresence>

      {hasMultiple ? (
        <>
          <button
            type="button"
            className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
            onClick={(e) => { e.stopPropagation(); goTo(current - 1); }}
            aria-label="Предыдущее фото"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
            onClick={(e) => { e.stopPropagation(); goTo(current + 1); }}
            aria-label="Следующее фото"
          >
            <ChevronRight size={16} />
          </button>

          <div className={styles.carouselDots}>
            {images.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className={i === current ? styles.carouselDotActive : styles.carouselDot}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
              />
            ))}
            {count > 5 ? <span className={styles.carouselDotMore}>+{count - 5}</span> : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function CatalogCard({ item, onOpen = () => {}, index = 0, initialFavorite = false, onFavoriteChange }: CatalogCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const locationLabel = formatCatalogCardLocation(item);
  const publishedLabel = formatRelativeDate(item.createdAt);
  const hourPrice = formatCatalogCardHourSecondary(item);
  const depositLabel = item.depositAmount
    ? `Залог ${formatDepositAmount(item.depositAmount)}`
    : null;
  const highlightItems = (item.quickFilters ?? []).slice(0, 2);
  const allImages = item.images?.length > 0 ? item.images : (item.coverImageUrl ? [item.coverImageUrl] : []);

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* ── Image area ── */}
      <div className={styles.cardImageArea}>
        <button
          type="button"
          className={`${styles.cardFavorite} ${isFavorite ? styles.cardFavoriteActive : ''}`}
          aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          onClick={(e) => { e.stopPropagation(); const next = !isFavorite; setIsFavorite(next); onFavoriteChange?.(item.id, next); }}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        <div className={styles.cardBadgeRow}>
          {item.featured && <span className={styles.cardFeatured}>Топ</span>}
          <span
            className={`${styles.cardStatus} ${
              item.isAvailable ? styles.cardStatusAvailable : styles.cardStatusSoon
            }`}
          >
            {item.isAvailable ? 'Доступно' : 'Скоро'}
          </span>
        </div>

        <div className={styles.cardImageWrap}>
          {allImages.length > 0 ? (
            <ImageCarousel
              images={allImages}
              alt={item.title}
              onImageClick={() => onOpen(item)}
            />
          ) : (
            <div className={styles.cardImagePlaceholder} onClick={() => onOpen(item)}>
              <Eye size={32} />
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <div className={styles.cardMetaRow}>
            <span className={styles.cardCategory}>{item.category}</span>
            <div className={styles.cardRating}>
              <Star size={12} className={styles.starIcon} />
              <span>{(item.ownerRating ?? 0).toFixed(1)}</span>
            </div>
          </div>

          <button type="button" onClick={() => onOpen(item)} className={styles.cardTitle}>
            {item.title}
          </button>

          <p className={styles.cardLocation}>
            <MapPin size={14} />
            <span>{locationLabel}</span>
          </p>
        </div>

        {/* ── Highlights ── */}
        <div className={styles.cardChips}>
          {highlightItems.map((hl) => {
            const Icon = highlightVisuals[hl as keyof typeof highlightVisuals] ?? ShieldCheck;
            return (
              <span key={hl} className={styles.cardChip}>
                <Icon size={12} />
                <span>{hl}</span>
              </span>
            );
          })}
          {!depositLabel ? (
            <span className={styles.cardChipGreen}>
              <ShieldCheck size={12} />
              <span>Без залога</span>
            </span>
          ) : null}
        </div>

        {/* ── Footer ── */}
        <div className={styles.cardFooter}>
          <div className={styles.cardPricing}>
            <div className={styles.cardPrice}>
              <strong>{formatCatalogCardPrimaryPrice(item)}</strong>
              {hourPrice ? <span className={styles.cardPriceSub}>{hourPrice}</span> : null}
            </div>

          </div>
        </div>

        {/* ── Subtle meta ── */}
        <div className={styles.cardMeta}>
          <span><Clock3 size={12} /> {publishedLabel}</span>
        </div>
      </div>
    </motion.article>
  );
}
