import type { CatalogUiItem } from '../types';
import { CatalogCard } from './CatalogCard';
import { formatPrice, formatRelativeDate, formatViews, getSecondaryPrice } from '../utils';
import styles from '../Catalog.module.scss';

type ProductDetailProps = {
  item: CatalogUiItem;
  similarItems: CatalogUiItem[];
  onBack: () => void;
  onOpenSimilar: (item: CatalogUiItem) => void;
};

export function ProductDetail({ item, similarItems, onBack, onOpenSimilar }: ProductDetailProps) {
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

      <div className={styles.detailHero}>
        <div className={styles.detailGallery}>
          <div className={styles.detailMainImageWrap}>
            <img src={item.images[0]} alt={item.title} className={styles.detailMainImage} />
            <div className={styles.detailFloatingMeta}>
              <span>{item.dateAvailable}</span>
              <span>{formatViews(item.views_count)}</span>
              <span>{formatRelativeDate(item.created_at)}</span>
            </div>
          </div>
          <div className={styles.detailThumbs}>
            {item.images.map((image, index) => (
              <img
                key={`${item.id}-${index}`}
                src={image}
                alt={`${item.title} ${index + 1}`}
                className={styles.detailThumb}
              />
            ))}
          </div>
        </div>

        <aside className={styles.detailSidebar}>
          <div className={styles.detailSidebarCardPrimary}>
            <div className={styles.detailTags}>
              <span>{item.category}</span>
              <span>{item.city}</span>
              {item.tags.slice(0, 2).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <h1>{item.title}</h1>
            <p className={styles.detailLead}>{item.item_description}</p>

            <div className={styles.detailPriceBlock}>
              <strong>{formatPrice(item.price_per_day, '/сутки')}</strong>
              <span>{getSecondaryPrice(item)}</span>
            </div>

            <dl className={styles.detailFacts}>
              <div>
                <dt>Залог</dt>
                <dd>{formatPrice(item.deposit_amount, '')}</dd>
              </div>
              <div>
                <dt>Получение</dt>
                <dd>{item.pickup_location}</dd>
              </div>
              <div>
                <dt>Выдача</dt>
                <dd>{item.pickupWindow}</dd>
              </div>
            </dl>

            <div className={styles.detailActionRow}>
              <button type="button" className={styles.primaryAction}>
                Забронировать
              </button>
              <button type="button" className={styles.secondaryAction}>
                Написать владельцу
              </button>
            </div>
          </div>

          <div className={styles.detailSidebarCardSecondary}>
            <div className={styles.sellerHeader}>
              <div className={styles.sellerAvatarLarge}>{item.ownerAvatar}</div>
              <div>
                <strong>{item.ownerName}</strong>
                <p>
                  ★ {item.ownerRating} · {item.responseTime}
                </p>
              </div>
            </div>
            <ul className={styles.sellerList}>
              <li>Проверенный профиль и понятные условия аренды</li>
              <li>Отвечает в чате и помогает с выдачей</li>
              <li>Можно обсудить продление и доставку</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className={styles.detailContentGrid}>
        <div className={styles.detailContentMain}>
          <section className={styles.detailSection}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.sidebarEyebrow}>Описание</p>
                <h2>Что входит в аренду</h2>
              </div>
            </div>
            <div className={styles.detailDescription}>
              {item.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <ul className={styles.detailTerms}>
              {item.rentalTerms.map((term) => (
                <li key={term}>{term}</li>
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

        <aside className={styles.detailContentAside}>
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
                <p>Интерфейс показывает сценарий проверки вещи до начала аренды.</p>
              </div>
              <div className={styles.trustCard}>
                <strong>Прозрачная стоимость</strong>
                <p>Цена, залог и окно получения видны до подключения business-логики.</p>
              </div>
              <div className={styles.trustCard}>
                <strong>Чат и бронирование</strong>
                <p>Кнопки и CTA готовы — Илья позже подключит данные и интеграцию.</p>
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
          {similarItems.map((similarItem) => (
            <CatalogCard
              key={similarItem.id}
              item={similarItem}
              pricingMode="day"
              onOpen={onOpenSimilar}
            />
          ))}
        </div>
      </section>
    </section>
  );
}
