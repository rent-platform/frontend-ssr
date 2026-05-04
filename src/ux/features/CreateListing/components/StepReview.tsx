'use client';

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
  return (
    <>
      <h2 className={styles.sectionTitle}>Проверьте перед публикацией</h2>
      <p className={styles.sectionSubtitle}>
        Убедитесь, что всё заполнено верно. Вы сможете отредактировать объявление позже.
      </p>

      {form.images.length > 0 && (
        <div className={styles.reviewBlock}>
          <h3 className={styles.reviewBlockTitle}>Фотографии</h3>
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
        <h3 className={styles.reviewBlockTitle}>Описание</h3>
        <ReviewRow label="Название" value={form.title} />
        <ReviewRow label="Категория" value={form.category} />
        <ReviewRow label="Состояние" value={CONDITION_LABELS[form.condition]} />
      </div>

      <div className={styles.reviewBlock}>
        <h3 className={styles.reviewBlockTitle}>Стоимость</h3>
        <ReviewRow
          label="Цена за сутки"
          value={form.pricePerDay ? `${form.pricePerDay} ₽` : undefined}
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

      {form.pickupLocation && (
        <div className={styles.reviewBlock}>
          <h3 className={styles.reviewBlockTitle}>Место выдачи</h3>
          <ReviewRow label="Адрес" value={form.pickupLocation} />
        </div>
      )}
    </>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles.reviewRow}>
      <span className={styles.reviewLabel}>{label}</span>
      <span className={styles.reviewValue}>{value || '—'}</span>
    </div>
  );
}
