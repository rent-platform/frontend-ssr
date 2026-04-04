import { Heart, MapPin, ShieldCheck, Sparkles, Star, Truck, Eye } from "lucide-react";
import type { CatalogCardViewModel } from "../types";
import {
  formatAvailability,
  formatMoney,
  formatViews,
  getDaysAgoLabel,
} from "../utils";
import styles from "./CatalogCard.module.scss";

type CatalogCardProps = {
  item: CatalogCardViewModel;
};

export function CatalogCard({ item }: CatalogCardProps) {
  const dayPrice = formatMoney(item.price_per_day);
  const hourPrice = formatMoney(item.price_per_hour);
  const deposit = formatMoney(item.deposit_amount) ?? "Без залога";

  return (
    <article className={styles.card}>
      <div className={styles.mediaWrap}>
        {item.featured && <span className={styles.featured}>Выбор недели</span>}

        <button type="button" className={styles.favorite} aria-label="Добавить в избранное">
          <Heart size={18} />
        </button>

        <img className={styles.image} src={item.imageUrl ?? ""} alt={item.title} loading="lazy" />

        <div className={styles.mediaFooter}>
          <span className={styles.category}>{item.category}</span>
          <span className={item.isAvailable ? styles.statusAvailable : styles.statusSoon}>
            {item.isAvailable ? "Доступно сейчас" : `Свободно с ${formatAvailability(item.dateAvailable)}`}
          </span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.metaLine}>
          <span className={styles.owner}>@{item.ownerName}</span>
          <span className={styles.rating}>
            <Star size={14} fill="currentColor" />
            {item.rating.toFixed(1)} · {item.reviewsCount}
          </span>
        </div>

        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.description}>{item.item_description}</p>

        <div className={styles.tags}>
          {item.instantBook && (
            <span className={styles.tagAccent}>
              <Sparkles size={14} />
              Моментальное бронирование
            </span>
          )}
          {item.delivery && (
            <span className={styles.tag}>
              <Truck size={14} />
              Есть доставка
            </span>
          )}
          <span className={styles.tag}>
            <ShieldCheck size={14} />
            {Number(item.deposit_amount) > 0 ? `Залог ${deposit}` : "Без залога"}
          </span>
        </div>

        <div className={styles.pricing}>
          <div>
            <span className={styles.priceCaption}>Стоимость</span>
            <div className={styles.priceRow}>
              {dayPrice && <strong>{dayPrice} / день</strong>}
              {hourPrice && <span>{hourPrice} / час</span>}
            </div>
          </div>

          <div className={styles.location}>
            <span>
              <MapPin size={14} />
              {item.pickup_location ?? item.location ?? "Самовывоз по договоренности"}
            </span>
            <span>
              <Eye size={14} />
              {formatViews(item.views_count)} просмотров
            </span>
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.dateBadge}>{getDaysAgoLabel(item.created_at)}</span>
          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton}>
              Написать
            </button>
            <button type="button" className={styles.primaryButton}>
              Открыть карточку
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
