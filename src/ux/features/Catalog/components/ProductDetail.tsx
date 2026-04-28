'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Eye,
  Heart,
  Info,
  MapPin,
  MessageCircle,
  Package,
  Share2,
  ShieldCheck,
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
  formatPrice,
  formatRelativeDate,
} from '../utils';
import { CatalogCard } from './CatalogCard';
import { RentalCalendar } from './RentalCalendar';
import styles from '../Catalog.module.scss';

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
  const [activeImage, setActiveImage] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const locationLabel = formatCatalogCardLocation(item);
  const publishedLabel = formatRelativeDate(item.createdAt);
  const primaryPrice = formatCatalogCardPrimaryPrice(item);
  const hourPrice = formatCatalogCardHourSecondary(item);
  const depositAmount = Number(String(item.depositAmount ?? '0').replace(/\s/g, ''));
  const depositLabel = depositAmount > 0 ? formatDepositAmount(item.depositAmount) : null;

  const dailyPrice = Number(String(item.pricePerDay ?? '0').replace(/\s/g, ''));
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);
  const subtotal = dailyPrice * (rentalDays || 1);

  const formatDateShort = (d: Date) =>
    d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

  const handleDateSelect = useCallback((start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const handleCalendarConfirm = useCallback(() => {
    setCalendarOpen(false);
  }, []);

  const handleProtectedAction = useCallback(() => {
    if (isGuest) {
      onAuthRequired?.();
      return;
    }

    setCalendarOpen(true);
  }, [isGuest, onAuthRequired]);

  const handleFavoriteToggle = useCallback(() => {
    if (isGuest) {
      onAuthRequired?.();
      return;
    }

    setIsFav((v) => !v);
  }, [isGuest, onAuthRequired]);

  const canPrev = activeImage > 0;
  const canNext = activeImage < item.images.length - 1;

  const goPrev = useCallback(() => {
    if (canPrev) setActiveImage((i) => i - 1);
  }, [canPrev]);

  const goNext = useCallback(() => {
    if (canNext) setActiveImage((i) => i + 1);
  }, [canNext]);

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
              {(item.tags ?? []).map((tag) => (
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
              {(item.specs ?? []).map((spec, i) => (
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
      <aside className={styles.detailSidebar}>
        <motion.div
          className={styles.bookingCard}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Price */}
          <div className={styles.bookingPriceRow}>
            <strong>{primaryPrice}</strong>
            {hourPrice && <span className={styles.bookingHourPrice}>· {hourPrice}</span>}
          </div>

          {/* Availability */}
          <div
            className={clsx(
              styles.bookingAvailability,
              item.isAvailable ? styles.bookingAvailabilityAvailable : styles.bookingAvailabilitySoon,
            )}
          >
            {item.isAvailable ? <Zap size={16} /> : <Clock3 size={16} />}
            {item.isAvailable ? 'Доступно для аренды' : `Доступно с ${item.nearestAvailableDate ?? '—'}`}
          </div>

          {/* Date Selector */}
          <div className={styles.bookingDates}>
            <div className={styles.bookingDateBtn}>
              <span className={styles.dateLabel}>Начало</span>
              <span className={startDate ? styles.dateValueActive : styles.dateValue}>
                <Calendar size={14} /> {startDate ? formatDateShort(startDate) : 'Не выбрано'}
              </span>
            </div>
            <div className={styles.bookingDateBtn}>
              <span className={styles.dateLabel}>Конец</span>
              <span className={endDate ? styles.dateValueActive : styles.dateValue}>
                <Calendar size={14} /> {endDate ? formatDateShort(endDate) : 'Не выбрано'}
              </span>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className={styles.bookingTotal}>
            <div className={styles.totalRow}>
              <span>{formatPrice(String(dailyPrice), '')} × {rentalDays || 1} {rentalDays === 1 ? 'день' : rentalDays < 5 ? 'дня' : 'дней'}</span>
              <span>{formatPrice(String(subtotal), '')}</span>
            </div>
            <div className={clsx(styles.totalRow, styles.grandTotal)}>
              <span>Итого</span>
              <span>{formatPrice(String(subtotal), '')}</span>
            </div>
          </div>

          {/* Deposit */}
          {depositLabel && (
            <div className={styles.depositRow}>
              <span><Info size={15} /> Залог (возвратный)</span>
              <span>{depositLabel}</span>
            </div>
          )}

          {/* Actions */}
          <AnimatePresence mode="wait">
            {startDate && endDate ? (
              <motion.div
                key="booked-actions"
                className={styles.bookedActions}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <button type="button" className={styles.primaryAction} onClick={isGuest ? onAuthRequired : undefined}>
                  <CreditCard size={18} />
                  Перейти к оплате
                </button>
                <button
                  type="button"
                  className={styles.changeDateBtn}
                  onClick={handleProtectedAction}
                >
                  <Calendar size={15} />
                  Изменить дату
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="book-btn"
                type="button"
                className={styles.primaryAction}
                onClick={handleProtectedAction}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                <Calendar size={18} />
                Забронировать
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {calendarOpen ? (
              <RentalCalendar
                startDate={startDate}
                endDate={endDate}
                onSelect={handleDateSelect}
                onConfirm={handleCalendarConfirm}
                onClose={() => setCalendarOpen(false)}
              />
            ) : null}
          </AnimatePresence>

          <div className={styles.bookingActions}>
            <button type="button" className={styles.secondaryAction} onClick={isGuest ? onAuthRequired : undefined}>
              <MessageCircle size={17} /> Написать
            </button>
          </div>
        </motion.div>

        {/* ─── Owner Card ─── */}
        <div className={styles.ownerCardCompact}>
          <div className={styles.ownerAvatarWrap}>
            <div className={styles.ownerAvatarFallback}>
              {item.ownerName.charAt(0)}
            </div>
            <div className={styles.ownerVerifiedBadge}>
              <CheckCircle2 />
            </div>
          </div>
          <div className={styles.ownerInfo}>
            <span className={styles.sidebarEyebrow}>Владелец</span>
            <span className={styles.ownerName}>{item.ownerName}</span>
            <div className={styles.ownerMeta}>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              {(item.ownerRating ?? 0).toFixed(1)} · 54 отзыва
            </div>
          </div>
        </div>

        {/* ─── Guarantee Card ─── */}
        <div className={styles.guaranteeCard}>
          <ShieldCheck size={20} />
          <div className={styles.guaranteeCardText}>
            <strong>Безопасная сделка</strong>
            <span>Оплата через платформу. Деньги списываются только после получения товара.</span>
          </div>
        </div>
      </aside>
    </motion.div>
  );
}