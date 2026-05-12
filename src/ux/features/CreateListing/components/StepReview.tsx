'use client';

import {
  Camera,
  FileText,
  Settings2,
  Tag,
  MapPin,
  AlignLeft,
} from 'lucide-react';
import type { CreateListingFormData, ListingCondition } from '../types';
import styles from '../CreateListing.module.scss';

const CONDITION_LABELS: Record<ListingCondition, string> = {
  new: 'Новый',
  like_new: 'Как новый',
  good: 'Хорошее',
  used: 'Б/у',
};

type StepReviewProps = {
  form: CreateListingFormData;
};

export function StepReview({ form }: StepReviewProps) {
  const filledSpecs = (form.specs ?? []).filter((s) => s.value.trim() !== '');

  return (
    <>
      <h2 className={styles.sectionTitle}>Проверьте перед публикацией</h2>
      <p className={styles.sectionSubtitle}>
        Убедитесь, что всё заполнено верно. Вы сможете отредактировать объявление позже.
      </p>

      {form.images.length > 0 && (
        <div className={styles.reviewBlock}>
          <div className={styles.reviewBlockHeader}>
            <div className={styles.reviewBlockIcon}><Camera size={16} /></div>
            <h3 className={styles.reviewBlockTitle}>Фотографии</h3>
            <span className={styles.reviewBlockBadge}>{form.images.length} шт.</span>
          </div>
          <div className={styles.reviewImages}>
            {form.images.map((img, i) => (
              <div key={img.id} className={styles.reviewImageThumb}>
                <img src={img.url} alt={`Фото ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.reviewBlock}>
        <div className={styles.reviewBlockHeader}>
          <div className={styles.reviewBlockIcon}><FileText size={16} /></div>
          <h3 className={styles.reviewBlockTitle}>Описание</h3>
        </div>
        <ReviewRow label="Название" value={form.title} />
        <ReviewRow label="Категория" value={form.category} />
        <ReviewRow label="Город" value={form.city} />
        <ReviewRow label="Состояние" value={CONDITION_LABELS[form.condition]} />
      </div>

      {form.description.trim() && (
        <div className={styles.reviewBlock}>
          <div className={styles.reviewBlockHeader}>
            <div className={styles.reviewBlockIcon}><AlignLeft size={16} /></div>
            <h3 className={styles.reviewBlockTitle}>Текст объявления</h3>
          </div>
          <p className={styles.reviewDescription}>{form.description}</p>
        </div>
      )}

      {filledSpecs.length > 0 && (
        <div className={styles.reviewBlock}>
          <div className={styles.reviewBlockHeader}>
            <div className={styles.reviewBlockIcon}><Settings2 size={16} /></div>
            <h3 className={styles.reviewBlockTitle}>Характеристики</h3>
            <span className={styles.reviewBlockBadge}>{filledSpecs.length}</span>
          </div>
          {filledSpecs.map((spec) => (
            <ReviewRow key={spec.label} label={spec.label} value={spec.value} />
          ))}
        </div>
      )}

      <div className={styles.reviewBlock}>
        <div className={styles.reviewBlockHeader}>
          <div className={styles.reviewBlockIcon}>
            <Tag size={16} />
          </div>
          <h3 className={styles.reviewBlockTitle}>Стоимость</h3>
        </div>
        <ReviewRow
          label="Цена за сутки"
          value={form.pricePerDay ? `${form.pricePerDay} ₽` : undefined}
          highlight
        />
        {form.pricePerHour && (
          <ReviewRow label="Цена за час" value={`${form.pricePerHour} ₽`} />
        )}
        <ReviewRow
          label="Залог"
          value={
            form.noDeposit
              ? 'Без залога'
              : form.depositAmount
                ? `${form.depositAmount} ₽`
                : undefined
          }
        />
      </div>

      {(form.city || form.pickupLocation) && (
        <div className={styles.reviewBlock}>
          <div className={styles.reviewBlockHeader}>
            <div className={styles.reviewBlockIcon}><MapPin size={16} /></div>
            <h3 className={styles.reviewBlockTitle}>Место передачи</h3>
          </div>
          <ReviewRow label="Город" value={form.city} />
          {form.pickupLocation && (
            <ReviewRow label="Адрес" value={form.pickupLocation} />
          )}
        </div>
      )}
    </>
  );
}

function ReviewRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value?: string;
  highlight?: boolean;
}) {
  return (
    <div className={styles.reviewRow}>
      <span className={styles.reviewLabel}>{label}</span>
      <span className={highlight ? styles.reviewValueHighlight : styles.reviewValue}>
        {value || '—'}
      </span>
    </div>
  );
}
