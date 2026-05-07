'use client';

import clsx from 'clsx';
import type { ListingCondition, CreateListingFormData } from '../types';
import styles from '../CreateListing.module.scss';

const CONDITIONS: { value: ListingCondition; label: string; desc: string }[] = [
  { value: 'new', label: 'Новый', desc: 'В оригинальной упаковке' },
  { value: 'like_new', label: 'Как новый', desc: 'Без следов износа' },
  { value: 'good', label: 'Хорошее', desc: 'Незначительные следы' },
  { value: 'used', label: 'Б/у', desc: 'Видимые следы использования' },
];

const CATEGORIES = [
  'Электроника',
  'Фото и видео',
  'Инструменты',
  'Для дома',
  'Спорт и отдых',
  'Детские товары',
  'Мероприятия',
];

type StepInfoProps = {
  form: Pick<CreateListingFormData, 'title' | 'category' | 'condition' | 'description'>;
  onPatch: (updates: Partial<CreateListingFormData>) => void;
};

export function StepInfo({ form, onPatch }: StepInfoProps) {
  return (
    <>
      <h2 className={styles.sectionTitle}>Описание вещи</h2>
      <p className={styles.sectionSubtitle}>
        Подробное описание помогает арендаторам быстрее найти вашу вещь.
      </p>

      <div className={styles.fieldGroup}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Название</label>
          <input
            className={styles.input}
            placeholder="Например: Canon EOS R5 с объективом 24-70mm"
            value={form.title}
            onChange={(e) => onPatch({ title: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Категория</label>
          <select
            className={styles.select}
            value={form.category}
            onChange={(e) => onPatch({ category: e.target.value })}
          >
            <option value="">Выберите категорию</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Состояние</label>
          <div className={styles.conditionGrid}>
            {CONDITIONS.map((c) => (
              <div
                key={c.value}
                className={clsx(styles.conditionCard,
                  form.condition === c.value && styles.conditionCardActive,
                )}
                onClick={() => onPatch({ condition: c.value })}
              >
                <span className={styles.conditionLabel}>{c.label}</span>
                <span className={styles.conditionDesc}>{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Описание</label>
          <textarea
            className={styles.textarea}
            placeholder="Расскажите о вещи: что входит в комплект, особенности, правила использования..."
            value={form.description}
            onChange={(e) => onPatch({ description: e.target.value })}
            rows={5}
          />
        </div>
      </div>
    </>
  );
}
