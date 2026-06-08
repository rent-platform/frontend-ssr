'use client';

import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import type { ListingCondition, CreateListingFormData } from '../types';
import { useDebouncedValue } from '@/business/shared';
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

type InfoLocalFields = Pick<CreateListingFormData, 'title' | 'description'>;

const INFO_LOCAL_FIELD_KEYS: (keyof InfoLocalFields)[] = ['title', 'description'];

function getChangedInfoFields(
  nextFields: InfoLocalFields,
  previousFields: InfoLocalFields,
): Partial<InfoLocalFields> {
  const updates: Partial<InfoLocalFields> = {};

  INFO_LOCAL_FIELD_KEYS.forEach((key) => {
    if (nextFields[key] !== previousFields[key]) {
      updates[key] = nextFields[key];
    }
  });

  return updates;
}

export function StepInfo({ form, onPatch }: StepInfoProps) {
  const lastCommittedRef = useRef<InfoLocalFields>({
    title: form.title,
    description: form.description,
  });
  const [localFields, setLocalFields] = useState<InfoLocalFields>({
    title: form.title,
    description: form.description,
  });
  const debouncedLocalFields = useDebouncedValue(localFields, 400);

  useEffect(() => {
    if (
      form.title === lastCommittedRef.current.title &&
      form.description === lastCommittedRef.current.description
    ) {
      return;
    }

    lastCommittedRef.current = {
      title: form.title,
      description: form.description,
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync local debounced fields when draft is reset externally.
    setLocalFields({
      title: form.title,
      description: form.description,
    });
  }, [form.description, form.title]);

  useEffect(() => {
    const updates = getChangedInfoFields(debouncedLocalFields, lastCommittedRef.current);
    if (!Object.keys(updates).length) {
      return;
    }

    lastCommittedRef.current = debouncedLocalFields;
    onPatch(updates);
  }, [debouncedLocalFields, onPatch]);

  const flushLocalFields = () => {
    const updates = getChangedInfoFields(localFields, lastCommittedRef.current);
    if (!Object.keys(updates).length) {
      return;
    }

    lastCommittedRef.current = localFields;
    onPatch(updates);
  };

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
            value={localFields.title}
            onChange={(e) => setLocalFields((current) => ({ ...current, title: e.target.value }))}
            onBlur={flushLocalFields}
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
            value={localFields.description}
            onChange={(e) => setLocalFields((current) => ({ ...current, description: e.target.value }))}
            onBlur={flushLocalFields}
            rows={5}
          />
        </div>
      </div>
    </>
  );
}
