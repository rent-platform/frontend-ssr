'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Info,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Share2,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import type { CatalogUiItem } from '../types';
import {
  formatCatalogCardLocation,
  formatCatalogCardPrimaryPrice,
  formatDepositAmount,
  formatPrice,
  formatRelativeDate,
  formatViews,
} from '../utils';
import { CatalogCard } from './CatalogCard';
import styles from '../Catalog.module.scss';

type ProductDetailProps = {
  item: CatalogUiItem;
  similarItems: CatalogUiItem[];
  onBack: () => void;
  onOpenSimilar: (item: CatalogUiItem) => void;
};

const quickFilterIcons = {
  'С доставкой': Truck,
  'Рядом сегодня': Sparkles,
  'Без залога': ShieldCheck,
  'Топ-рейтинг': Star,
  Новинки: Sparkles,
} as const;

function getOwnerInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function isExternalImage(value: string | undefined) {
  return Boolean(value && /^https?:\/\//.test(value));
}

export function ProductDetail({
  item,
  similarItems,
  onBack,
  onOpenSimilar,
}: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0);

  const locationLabel = formatCatalogCardLocation(item);
  const publishedLabel = formatRelativeDate(item.created_at);
  const viewsLabel = formatViews(item.views_count);
  const primaryPrice = formatCatalogCardPrimaryPrice(item);
  const secondaryPrice = item.price_per_hour
    ? formatPrice(item.price_per_hour, '/час')
    : 'Почасовой тариф не указан';
  const depositLabel = item.deposit_amount
    ? formatDepositAmount(item.deposit_amount)
    : 'без залога';
  const ownerAvatarSrc = isExternalImage(item.ownerAvatar) ? item.ownerAvatar : undefined;
  const ownerInitial = getOwnerInitial(item.ownerName);
  const descriptionParagraphs = item.description.length
    ? item.description
    : [item.item_description || 'Описание появится позже.'];
  const dailyPrice = Number(String(item.price_per_day ?? item.price_per_hour ?? '0').replace(/\s/g, '').replace(',', '.'));
  const rentalDays = 3;
  const subtotal = dailyPrice * rentalDays;
  const serviceFee = Math.max(290, Math.round(dailyPrice * 0.08));
  const total = subtotal + serviceFee;

  const serviceHighlights = [
    {
      label: 'Доступность',
      value: item.isAvailable ? 'Можно забрать сегодня' : item.dateAvailable,
      statusClass: item.isAvailable ? styles.available : styles.unavailable,
      Icon: Calendar,
    },
    {
      label: 'Выдача',
      value: item.pickupWindow,
      Icon: Clock3,
    },
    {
      label: 'Ответ владельца',
      value: item.responseTime,
      Icon: MessageCircle,
    },
    {
      label: 'Залог',
      value: item.deposit_amount ? depositLabel : 'Не требуется',
      Icon: ShieldCheck,
    },
  ];

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailContentMain}>
        <button type="button" onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={18} />
          <span>Назад к каталогу</span>
        </button>

        <section className={styles.detailGallery}>
          <div className={styles.mainImageWrap}>
            <motion.img
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.28 }}
              src={item.images[activeImage]}
              alt={item.title}
              className={styles.detailMainImage}
            />

            <div className={styles.detailGalleryOverlay}>
              <div className={styles.detailGalleryBadges}>
                <span className={styles.detailCategory}>{item.category}</span>
                {item.featured ? <span className={styles.detailFeaturedBadge}>Топ выбор</span> : null}
                <span className={item.isAvailable ? styles.available : styles.unavailable}>
                  {item.isAvailable ? 'Доступно сейчас' : 'Скоро свободно'}
                </span>
              </div>

              <span className={styles.detailImageCounter}>
                {activeImage + 1}/{item.images.length}
              </span>
            </div>
          </div>

          <div className={styles.detailThumbs}>
            {item.images.map((img, idx) => (
              <button
                key={img}
                type="button"
                className={`${styles.detailThumb} ${idx === activeImage ? styles.detailThumbActive : ''}`}
                onClick={() => setActiveImage(idx)}
                aria-label={`Показать изображение ${idx + 1}`}
              >
                <img src={img} alt={`${item.title} ${idx + 1}`} />
              </button>
            ))}
          </div>
        </section>

        <motion.section
          className={styles.detailHeader}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className={styles.detailMetaTop}>
            <div className={styles.detailLabelRow}>
              <span className={styles.detailCategory}>{item.category}</span>
              {item.quickFilters.slice(0, 2).map((filter) => {
                const Icon = quickFilterIcons[filter as keyof typeof quickFilterIcons] ?? Sparkles;

                return (
                  <span key={filter} className={styles.detailQuickFilter}>
                    <Icon size={14} />
                    <span>{filter}</span>
                  </span>
                );
              })}
            </div>

            <div className={styles.detailRating}>
              <Star size={14} fill="currentColor" color="currentColor" />
              <strong>{item.ownerRating}</strong>
              <span>{viewsLabel}</span>
            </div>
          </div>

          <h1>{item.title}</h1>

          <p className={styles.detailLead}>{item.item_description || descriptionParagraphs[0]}</p>

          <div className={styles.detailLocation}>
            <MapPin size={16} />
            <span>{locationLabel}</span>
          </div>

          <div className={styles.detailTrustRow}>
            <div className={styles.detailTrustItem}>
              <Clock3 size={16} />
              <div>
                <span>Опубликовано</span>
                <strong>{publishedLabel}</strong>
              </div>
            </div>

            <div className={styles.detailTrustItem}>
              <MessageCircle size={16} />
              <div>
                <span>Ответ владельца</span>
                <strong>{item.responseTime}</strong>
              </div>
            </div>

            <div className={styles.detailTrustItem}>
              <Truck size={16} />
              <div>
                <span>Самовывоз / доставка</span>
                <strong>{item.pickup_location ?? locationLabel}</strong>
              </div>
            </div>
          </div>
        </motion.section>

        <section className={styles.detailSpecs}>
          {serviceHighlights.map(({ label, value, statusClass, Icon }) => (
            <div key={label} className={styles.specItem}>
              <div className={styles.specItemIcon}>
                <Icon size={18} />
              </div>
              <div className={styles.specItemContent}>
                <span>{label}</span>
                {statusClass ? <strong className={statusClass}>{value}</strong> : <strong>{value}</strong>}
              </div>
            </div>
          ))}
        </section>

        <div className={styles.detailContentGrid}>
          <section className={styles.detailDescription}>
            <div className={styles.detailSectionHeader}>
              <h2>О товаре</h2>
              <p>Коротко и по делу: что получит пользователь и в каком состоянии вещь.</p>
            </div>

            <div className={styles.detailParagraphs}>
              {descriptionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className={styles.tagCloud}>
              {item.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          <section className={styles.detailTermsCard}>
            <div className={styles.detailSectionHeader}>
              <h2>Условия аренды</h2>
              <p>Важные детали перед бронированием и получением вещи.</p>
            </div>

            <ul className={styles.detailTermsList}>
              {item.rentalTerms.map((term) => (
                <li key={term} className={styles.detailTermsItem}>
                  <CheckCircle2 size={16} />
                  <span>{term}</span>
                </li>
              ))}
            </ul>

            <div className={styles.detailInlineNotice}>
              <Info size={16} />
              <span>
                Выдача: <strong>{item.pickupWindow}</strong>. Локация: <strong>{item.pickup_location ?? locationLabel}</strong>.
              </span>
            </div>
          </section>
        </div>

        <section className={styles.detailAttributes}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Характеристики</h2>
              <p>Технические и сервисные параметры, которые влияют на выбор.</p>
            </div>
          </div>

          <div className={styles.detailSpecsGrid}>
            {item.specs.map((spec) => (
              <div key={`${spec.label}-${spec.value}`} className={styles.detailSpecCard}>
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </div>
            ))}
          </div>
        </section>

        {similarItems.length > 0 ? (
          <section className={styles.similarSection}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Похожие предложения</h2>
                <p>Еще несколько вариантов из той же категории, если хочется сравнить.</p>
              </div>
              <button type="button" className={styles.viewAllLink} onClick={onBack}>
                <span>Все предложения</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className={styles.similarGrid}>
              {similarItems.map((similar, idx) => (
                <CatalogCard key={similar.id} item={similar} index={idx} onOpen={onOpenSimilar} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <aside className={styles.detailSidebar}>
        <motion.div
          className={styles.bookingCard}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
        >
          <div className={styles.bookingCardHeader}>
            <div>
              <p className={styles.sidebarEyebrow}>Онлайн-бронирование</p>
              <div className={styles.bookingPriceRow}>
                <strong>{primaryPrice}</strong>
              </div>
              <p className={styles.bookingSecondaryPrice}>{secondaryPrice}</p>
            </div>

            <div className={styles.bookingStatusRow}>
              <span className={item.isAvailable ? styles.bookingStatusActive : styles.bookingStatusNeutral}>
                {item.isAvailable ? 'Доступно сегодня' : item.dateAvailable}
              </span>
              <span className={styles.bookingStatusNeutral}>
                Залог {depositLabel}
              </span>
            </div>
          </div>

          <div className={styles.bookingFieldGrid}>
            <div className={styles.bookingFieldCard}>
              <span>Старт аренды</span>
              <strong>{item.isAvailable ? 'Сегодня' : 'Ближайшая дата'}</strong>
            </div>
            <div className={styles.bookingFieldCard}>
              <span>Срок</span>
              <strong>{rentalDays} дня</strong>
            </div>
          </div>

          <div className={styles.bookingForm}>
            <div className={styles.bookingField}>
              <label>Период аренды</label>
              <div className={styles.datePickerPlaceholder}>
                <Calendar size={18} />
                <span>Выберите даты бронирования</span>
              </div>
            </div>

            <div className={styles.bookingTotal}>
              <div className={styles.totalRow}>
                <span>Аренда ({rentalDays} дня)</span>
                <strong>{formatPrice(String(subtotal), '')}</strong>
              </div>
              <div className={styles.totalRow}>
                <span>Сервисный сбор</span>
                <strong>{formatPrice(String(serviceFee), '')}</strong>
              </div>
              <div className={styles.totalRow}>
                <span>Залог</span>
                <strong>{item.deposit_amount ? depositLabel : 'Без залога'}</strong>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Итого сейчас</span>
                <strong>{formatPrice(String(total), '')}</strong>
              </div>
            </div>

            <div className={styles.detailActionRow}>
              <button type="button" className={styles.primaryAction}>
                Забронировать
              </button>

              <button type="button" className={styles.secondaryAction}>
                <MessageCircle size={18} />
                <span>Написать владельцу</span>
              </button>
            </div>
          </div>

          <ul className={styles.bookingMetaList}>
            <li>
              <Banknote size={16} />
              <span>Оплата проходит после подтверждения и безопасной проверки брони.</span>
            </li>
            <li>
              <MapPin size={16} />
              <span>Самовывоз: {item.pickup_location ?? locationLabel}</span>
            </li>
            <li>
              <Clock3 size={16} />
              <span>Окно выдачи: {item.pickupWindow}</span>
            </li>
          </ul>

          <div className={styles.bookingGuarantees}>
            <div className={styles.guaranteeItem}>
              <ShieldCheck size={16} />
              <span>Безопасная сделка через платформу</span>
            </div>
            <div className={styles.guaranteeItem}>
              <CheckCircle2 size={16} />
              <span>Проверенный владелец с высоким рейтингом</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={styles.ownerCardCompact}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          {ownerAvatarSrc ? (
            <img src={ownerAvatarSrc} alt={item.ownerName} />
          ) : (
            <div className={styles.ownerAvatarFallback} aria-hidden="true">
              {ownerInitial}
            </div>
          )}

          <div className={styles.ownerInfo}>
            <span className={styles.sidebarEyebrow}>Владелец</span>
            <strong>{item.ownerName}</strong>
            <div className={styles.ownerMeta}>
              <Star size={12} fill="currentColor" color="currentColor" />
              <span>{item.ownerRating} • отвечает быстро</span>
            </div>
            <p className={styles.ownerDescription}>
              Обычно подтверждает заявки без долгого ожидания и помогает с выдачей на месте.
            </p>
          </div>
        </motion.div>

        <div className={styles.sidebarActions}>
          <button type="button" className={styles.sidebarActionButton}>
            <Share2 size={18} />
            <span>Поделиться</span>
          </button>
          <button type="button" className={styles.sidebarActionButton}>
            <Info size={18} />
            <span>Пожаловаться</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
