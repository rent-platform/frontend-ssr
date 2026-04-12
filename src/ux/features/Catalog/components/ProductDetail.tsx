'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import type { CatalogUiItem } from '../types';
import { formatCatalogCardLocation, formatCatalogCardPrimaryPrice } from '../utils';
import { CatalogCard } from './CatalogCard';
import styles from '../Catalog.module.scss';

type ProductDetailProps = {
  item: CatalogUiItem;
  similarItems: CatalogUiItem[];
  onBack: () => void;
  onOpenSimilar: (item: CatalogUiItem) => void;
};

export function ProductDetail({
  item,
  similarItems,
  onBack,
  onOpenSimilar,
}: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className={styles.detailPage}>
      <div className={styles.detailContentMain}>
        <button type="button" onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={20} />
          Назад к каталогу
        </button>

        <section className={styles.detailGallery}>
          <div className={styles.mainImageWrap}>
            <motion.img
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={item.images[activeImage]}
              alt={item.title}
              className={styles.detailMainImage}
            />
          </div>
          <div className={styles.detailThumbs}>
            {item.images.map((img, idx) => (
              <button
                key={img}
                type="button"
                className={`${styles.detailThumb} ${idx === activeImage ? styles.detailThumbActive : ''}`}
                onClick={() => setActiveImage(idx)}
              >
                <img src={img} alt={`${item.title} ${idx + 1}`} />
              </button>
            ))}
          </div>
        </section>

        <section className={styles.detailHeader}>
          <div className={styles.detailMetaTop}>
            <span className={styles.detailCategory}>{item.category}</span>
            <div className={styles.detailRating}>
              <Star size={14} fill="#ffb800" color="#ffb800" />
              <strong>{item.ownerRating}</strong>
              <span>({item.views_count} просмотров)</span>
            </div>
          </div>
          <h1>{item.title}</h1>
          <div className={styles.detailLocation}>
            <MapPin size={16} />
            <span>{formatCatalogCardLocation(item)}</span>
          </div>
        </section>

        <section className={styles.detailDescription}>
          <h2>Описание товара</h2>
          <p>{item.item_description || 'Описание отсутствует.'}</p>
          <div className={styles.tagCloud}>
            {item.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        </section>

        <section className={styles.detailSpecs}>
          <div className={styles.specItem}>
            <span>Состояние</span>
            <span>{item.condition || 'Отличное'}</span>
          </div>
          <div className={styles.specItem}>
            <span>Мин. срок аренды</span>
            <span>1 день</span>
          </div>
          <div className={styles.specItem}>
            <span>Залог</span>
            <span>{item.deposit_amount ? `${item.deposit_amount} ₽` : 'Без залога'}</span>
          </div>
          <div className={styles.specItem}>
            <span>Доступность</span>
            <span className={item.isAvailable ? styles.available : styles.unavailable}>
              {item.isAvailable ? 'Доступен сейчас' : 'Занят до ' + item.dateAvailable}
            </span>
          </div>
        </section>

        <section className={styles.similarSection}>
          <div className={styles.sectionHeader}>
            <h2>Похожие предложения</h2>
            <button type="button" className={styles.viewAllLink}>
              Смотреть все <ChevronRight size={16} />
            </button>
          </div>
          <div className={styles.similarGrid}>
            {similarItems.map((similar, idx) => (
              <CatalogCard key={similar.id} item={similar} index={idx} onOpen={onOpenSimilar} />
            ))}
          </div>
        </section>
      </div>

      <aside className={styles.detailSidebar}>
        <div className={styles.bookingCard}>
          <div className={styles.bookingPriceRow}>
            <strong>{formatCatalogCardPrimaryPrice(item)}</strong>
            <span>/ день</span>
          </div>

          <div className={styles.bookingForm}>
            <div className={styles.bookingField}>
              <label>Период аренды</label>
              <div className={styles.datePickerPlaceholder}>
                <Calendar size={18} />
                <span>Выберите даты</span>
              </div>
            </div>

            <div className={styles.bookingTotal}>
              <div className={styles.totalRow}>
                <span>Аренда (3 дня)</span>
                <span>4 500 ₽</span>
              </div>
              <div className={styles.totalRow}>
                <span>Сервисный сбор</span>
                <span>250 ₽</span>
              </div>
              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span>Итого</span>
                <span>4 750 ₽</span>
              </div>
            </div>

            <button type="button" className={styles.bookingAction}>
              Забронировать
            </button>
            
            <button type="button" className={styles.messageAction}>
              <MessageCircle size={20} />
              Написать владельцу
            </button>
          </div>

          <div className={styles.bookingGuarantees}>
            <div className={styles.guaranteeItem}>
              <ShieldCheck size={16} />
              <span>Безопасная сделка</span>
            </div>
            <div className={styles.guaranteeItem}>
              <CheckCircle2 size={16} />
              <span>Проверенный владелец</span>
            </div>
          </div>
        </div>

        <div className={styles.ownerCardCompact}>
          <img src={item.ownerAvatar} alt={item.ownerName} />
          <div className={styles.ownerInfo}>
            <strong>{item.ownerName}</strong>
            <div className={styles.ownerMeta}>
              <Star size={12} fill="#ffb800" color="#ffb800" />
              <span>{item.ownerRating} • На сервисе 2 года</span>
            </div>
          </div>
        </div>

        <div className={styles.sidebarActions}>
          <button type="button" className={styles.sidebarActionButton}>
            <Share2 size={18} />
            Поделиться
          </button>
          <button type="button" className={styles.sidebarActionButton}>
            <Info size={18} />
            Пожаловаться
          </button>
        </div>
      </aside>
    </div>
  );
}
