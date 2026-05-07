'use client';

import { Shield } from 'lucide-react';
import clsx from 'clsx';
import type { CreateListingFormData } from '../types';
import styles from '../CreateListing.module.scss';

type StepPricingProps = {
  form: Pick<CreateListingFormData, 'pricePerDay' | 'pricePerHour' | 'depositAmount' | 'noDeposit' | 'pickupLocation'>;
  onPatch: (updates: Partial<CreateListingFormData>) => void;
};

export function StepPricing({ form, onPatch }: StepPricingProps) {
  return (
    <>
      <h2 className={styles.sectionTitle}>Стоимость и условия</h2>
      <p className={styles.sectionSubtitle}>
        Установите цены и условия аренды. Конкурентная цена повышает число заявок.
      </p>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Цена за сутки</label>
            <div className={styles.inputWithPrefix}>
              <span className={styles.inputPrefix}>₽</span>
              <input
                className={clsx(styles.input, styles.inputPrefixed)}
                type="number"
                placeholder="500"
                value={form.pricePerDay}
                onChange={(e) => onPatch({ pricePerDay: e.target.value })}
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Цена за час</label>
            <div className={styles.inputWithPrefix}>
              <span className={styles.inputPrefix}>₽</span>
              <input
                className={clsx(styles.input, styles.inputPrefixed)}
                type="number"
                placeholder="100"
                value={form.pricePerHour}
                onChange={(e) => onPatch({ pricePerHour: e.target.value })}
              />
            </div>
            <span className={styles.fieldHint}>Необязательно</span>
          </div>
        </div>

        <div
          className={clsx(styles.toggleRow, form.noDeposit && styles.toggleRowActive)}
          onClick={() => onPatch({ noDeposit: !form.noDeposit, depositAmount: '' })}
        >
          <div className={styles.toggleInfo}>
            <span className={styles.toggleLabel}>
              <Shield size={14} />
              Без залога
            </span>
            <span className={styles.toggleHint}>Повышает привлекательность объявления</span>
          </div>
          <button
            type="button"
            className={clsx(styles.toggle, form.noDeposit && styles.toggleOn)}
            onClick={(e) => { e.stopPropagation(); onPatch({ noDeposit: !form.noDeposit, depositAmount: '' }); }}
          />
        </div>

        {!form.noDeposit && (
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Сумма залога</label>
            <div className={styles.inputWithPrefix}>
              <span className={styles.inputPrefix}>₽</span>
              <input
                className={clsx(styles.input, styles.inputPrefixed)}
                type="number"
                placeholder="2000"
                value={form.depositAmount}
                onChange={(e) => onPatch({ depositAmount: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Место выдачи</label>
          <input
            className={styles.input}
            placeholder="Новосибирск, Центральный район"
            value={form.pickupLocation}
            onChange={(e) => onPatch({ pickupLocation: e.target.value })}
          />
          <span className={styles.fieldHint}>Город, район или адрес для самовывоза</span>
        </div>
      </div>
    </>
  );
}
