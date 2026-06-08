'use client';

import { Shield } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import type { CreateListingFormData } from '../types';
import { useDebouncedValue } from '@/business/shared';
import styles from '../CreateListing.module.scss';

type StepPricingProps = {
  form: Pick<CreateListingFormData, 'pricePerDay' | 'pricePerHour' | 'depositAmount' | 'noDeposit' | 'pickupLocation'>;
  onPatch: (updates: Partial<CreateListingFormData>) => void;
};

type PricingLocalFields = Pick<CreateListingFormData, 'pricePerDay' | 'pricePerHour' | 'depositAmount' | 'pickupLocation'>;

const PRICING_LOCAL_FIELD_KEYS: (keyof PricingLocalFields)[] = [
  'pricePerDay',
  'pricePerHour',
  'depositAmount',
  'pickupLocation',
];

function getChangedPricingFields(
  nextFields: PricingLocalFields,
  previousFields: PricingLocalFields,
): Partial<PricingLocalFields> {
  const updates: Partial<PricingLocalFields> = {};

  PRICING_LOCAL_FIELD_KEYS.forEach((key) => {
    if (nextFields[key] !== previousFields[key]) {
      updates[key] = nextFields[key];
    }
  });

  return updates;
}

export function StepPricing({ form, onPatch }: StepPricingProps) {
  const lastCommittedRef = useRef<PricingLocalFields>({
    pricePerDay: form.pricePerDay,
    pricePerHour: form.pricePerHour,
    depositAmount: form.depositAmount,
    pickupLocation: form.pickupLocation,
  });
  const [localFields, setLocalFields] = useState<PricingLocalFields>({
    pricePerDay: form.pricePerDay,
    pricePerHour: form.pricePerHour,
    depositAmount: form.depositAmount,
    pickupLocation: form.pickupLocation,
  });
  const debouncedLocalFields = useDebouncedValue(localFields, 400);

  useEffect(() => {
    if (
      form.pricePerDay === lastCommittedRef.current.pricePerDay &&
      form.pricePerHour === lastCommittedRef.current.pricePerHour &&
      form.depositAmount === lastCommittedRef.current.depositAmount &&
      form.pickupLocation === lastCommittedRef.current.pickupLocation
    ) {
      return;
    }

    lastCommittedRef.current = {
      pricePerDay: form.pricePerDay,
      pricePerHour: form.pricePerHour,
      depositAmount: form.depositAmount,
      pickupLocation: form.pickupLocation,
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync local debounced fields when draft is reset externally.
    setLocalFields({
      pricePerDay: form.pricePerDay,
      pricePerHour: form.pricePerHour,
      depositAmount: form.depositAmount,
      pickupLocation: form.pickupLocation,
    });
  }, [form.depositAmount, form.pickupLocation, form.pricePerDay, form.pricePerHour]);

  useEffect(() => {
    const updates = getChangedPricingFields(debouncedLocalFields, lastCommittedRef.current);
    if (!Object.keys(updates).length) {
      return;
    }

    lastCommittedRef.current = debouncedLocalFields;
    onPatch(updates);
  }, [debouncedLocalFields, onPatch]);

  const flushLocalFields = () => {
    const updates = getChangedPricingFields(localFields, lastCommittedRef.current);
    if (!Object.keys(updates).length) {
      return;
    }
    lastCommittedRef.current = localFields;
    onPatch(updates);
  };

  const toggleNoDeposit = () => {
    const nextDepositAmount = '';
    const updates: Partial<CreateListingFormData> = {
      noDeposit: !form.noDeposit,
    };

    setLocalFields((current) => ({ ...current, depositAmount: nextDepositAmount }));
    lastCommittedRef.current = { ...lastCommittedRef.current, depositAmount: nextDepositAmount };

    if (form.depositAmount !== nextDepositAmount) {
      updates.depositAmount = nextDepositAmount;
    }

    onPatch(updates);
  };

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
                value={localFields.pricePerDay}
                onChange={(e) => setLocalFields((current) => ({ ...current, pricePerDay: e.target.value }))}
                onBlur={flushLocalFields}
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
                value={localFields.pricePerHour}
                onChange={(e) => setLocalFields((current) => ({ ...current, pricePerHour: e.target.value }))}
                onBlur={flushLocalFields}
              />
            </div>
            <span className={styles.fieldHint}>Необязательно</span>
          </div>
        </div>

        <div
          className={clsx(styles.toggleRow, form.noDeposit && styles.toggleRowActive)}
          onClick={toggleNoDeposit}
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
            onClick={(e) => {
              e.stopPropagation();
              toggleNoDeposit();
            }}
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
                value={localFields.depositAmount}
                onChange={(e) => setLocalFields((current) => ({ ...current, depositAmount: e.target.value }))}
                onBlur={flushLocalFields}
              />
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Место выдачи</label>
          <input
            className={styles.input}
            placeholder="Новосибирск, Центральный район"
            value={localFields.pickupLocation}
            onChange={(e) => setLocalFields((current) => ({ ...current, pickupLocation: e.target.value }))}
            onBlur={flushLocalFields}
          />
          <span className={styles.fieldHint}>Город, район или адрес для самовывоза</span>
        </div>
      </div>
    </>
  );
}
