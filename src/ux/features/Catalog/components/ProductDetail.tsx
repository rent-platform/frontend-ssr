'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import type { CatalogUiItem } from '../types';
import { CatalogCard } from './CatalogCard';
import { BookingCard } from './BookingCard';
import { formatRelativeDate, formatViews } from '../utils';
import styles from '../Catalog.module.scss';

type ProductDetailProps = {
  item: CatalogUiItem;
  similarItems: CatalogUiItem[];
  onBack: () => void;
  onOpenSimilar: (item: CatalogUiItem) => void;
};

export function ProductDetail({ item, similarItems, onBack, onOpenSimilar }: ProductDetailProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const hasImageNavigation = item.images.length > 1;
  const activeImage = useMemo(
    () => item.images[activeImageIndex] ?? item.images[0],
    [activeImageIndex, item.images],
  );
  const normalizedDescription = useMemo(
    () => item.description.map((paragraph) => paragraph.trim()).filter(Boolean),
    [item.description],
  );
  const [descriptionLead, ...descriptionPoints] = normalizedDescription;
  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? item.images.length - 1 : prev - 1));
  };
  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % item.images.length);
  };

  return (
    <section className={styles.detailPage}>
      <div className={styles.detailBreadcrumbs}>
        <button type="button" onClick={onBack} className={styles.backButton}>
          ← Назад к каталогу
        </button>
        <span>Каталог</span>
        <span>·</span>
        <span>{item.category}</span>
      </div>

      <div className={styles.detailTopMeta}>
        <div>
          <h1>{item.title}</h1>
          <p>
            {item.location} · {formatViews(item.views_count)} · {formatRelativeDate(item.created_at)}
          </p>
        </div>
        <div className={styles.detailActionIcons}>
          <button type="button">♡ В избранное</button>
          <button type="button">↗ Поделиться</button>
        </div>
      </div>

      <div className={styles.detailShell}>
        <div className={styles.detailPrimaryColumn}>
          <div className={styles.detailGalleryCard}>
            <div className={styles.detailMainImageWrap}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt={item.title}
                  className={styles.detailMainImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
              {hasImageNavigation ? (
                <>
                  <button
                    type="button"
                    className={styles.detailMainImageNavLeft}
                    aria-label="Предыдущее фото"
                    onClick={handlePrevImage}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className={styles.detailMainImageNavRight}
                    aria-label="Следующее фото"
                    onClick={handleNextImage}
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>

            <div className={styles.detailThumbs}>
              {item.images.map((image, index) => (
                <button
                  type="button"
                  key={`${item.id}-${index}`}
                  className={index === activeImageIndex ? styles.detailThumbButtonActive : styles.detailThumbButton}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={image} alt={`${item.title} ${index + 1}`} className={styles.detailThumb} />
                </button>
              ))}
            </div>
          </div>

          <section className={styles.detailSection}>
            <div className={styles.detailTags}>
              {item.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <p className={styles.detailLead}>{item.item_description.trim()}</p>

            <dl className={styles.detailFacts}>
              <div>
                <dt>Владелец</dt>
                <dd>{item.ownerName}</dd>
              </div>
              <div>
                <dt>Рейтинг</dt>
                <dd>★ {item.ownerRating}</dd>
              </div>
              <div>
                <dt>Выдача</dt>
                <dd>{item.pickup_location}</dd>
              </div>
              <div>
                <dt>Окно выдачи</dt>
                <dd>{item.pickupWindow}</dd>
              </div>
            </dl>

            <div className={styles.detailActionRowInline}>
              <button type="button" className={styles.primaryAction}>
                Забронировать
              </button>
              <button type="button" className={styles.secondaryAction}>
                Написать владельцу
              </button>
            </div>
          </section>

          <section className={styles.detailSection}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.sidebarEyebrow}>Описание</p>
                <h2>Что входит в аренду</h2>
              </div>
            </div>

            <div className={styles.detailDescription}>
              {descriptionLead ? <p className={styles.detailDescriptionLead}>{descriptionLead}</p> : null}
              {descriptionPoints.length ? (
                <ul className={styles.detailDescriptionList}>
                  {descriptionPoints.map((paragraph) => (
                    <li key={paragraph}>{paragraph}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <ul className={styles.detailTerms}>
              {item.rentalTerms.map((term) => (
                <li key={term}>{term.trim()}</li>
              ))}
            </ul>
          </section>

          <section className={styles.detailSection}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.sidebarEyebrow}>Характеристики</p>
                <h2>Параметры вещи</h2>
              </div>
            </div>

            <div className={styles.specGrid}>
              {item.specs.map((spec) => (
                <div key={spec.label} className={styles.specCard}>
                  <span>{spec.label}</span>
                  <strong>{spec.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.detailSidebar}>
          <BookingCard item={item} />

          <div className={styles.detailSidebarCardSecondary}>
            <div className={styles.sellerHeader}>
              <div className={styles.sellerAvatarLarge} aria-hidden="true">{item.ownerAvatar}</div>
              <div>
                <strong>{item.ownerName}</strong>
                <p>
                  ★ {item.ownerRating} · {item.responseTime}
                </p>
              </div>
            </div>
            <ul className={styles.sellerList}>
              <li>Проверенный профиль и прозрачные условия аренды</li>
              <li>Можно согласовать доставку и продление</li>
              <li>Интерфейс готовиться к подключению чата и бронирования</li>
            </ul>
          </div>

          <section className={styles.detailSection}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.sidebarEyebrow}>Доверие</p>
                <h2>Почему арендуют здесь</h2>
              </div>
            </div>
            <div className={styles.trustCardList}>
              <div className={styles.trustCard}>
                <strong>Осмотр при выдаче</strong>
                <p>Понятный интерфейс проверки вещи до начала аренды.</p>
              </div>
              <div className={styles.trustCard}>
                <strong>Прозрачная стоимость</strong>
                <p>Цена, залог и окно получения показаны заранее.</p>
              </div>
              <div className={styles.trustCard}>
                <strong>Сценарий бронирования</strong>
                <p>UI-модуль для подключения к реальной бизнес логике.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <section className={styles.similarSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.sidebarEyebrow}>Похожие объявления</p>
            <h2>Ещё вещи в этом сценарии</h2>
          </div>
        </div>

        <div className={styles.similarGrid}>
          <AnimatePresence mode="popLayout">
            {similarItems.map((similarItem, index) => (
              <CatalogCard
                key={similarItem.id}
                item={similarItem}
                pricingMode="day"
                onOpen={onOpenSimilar}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>
    </section>
  );
}
