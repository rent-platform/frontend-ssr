'use client';

import { formatDealDate, formatDealPrice } from '../dealDetailsHelpers';
import styles from '../DealDetailsPage.module.scss';

interface DealConditionsProps {
  startDate: string;
  endDate: string;
  rentalPrice: number;
  deposit: number;
  city: string;
  pickupLocation: string;
}

export function DealConditions({
  startDate,
  endDate,
  rentalPrice,
  deposit,
  city,
  pickupLocation,
}: DealConditionsProps) {
  const rows = [
    { label: 'Период', value: `${formatDealDate(startDate)} \u2014 ${formatDealDate(endDate)}` },
    { label: 'Стоимость аренды', value: formatDealPrice(rentalPrice) },
    { label: 'Залог', value: formatDealPrice(deposit) },
    { label: 'Город', value: city },
    { label: 'Место передачи', value: pickupLocation },
  ];

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Условия сделки</h3>
      <div className={styles.conditionsGrid}>
        {rows.map((row) => (
          <div key={row.label} style={{ display: 'contents' }}>
            <span className={styles.conditionLabel}>{row.label}</span>
            <span className={styles.conditionValue}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
