'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { PaymentMethod } from '../types';
import { MOCK_PAYMENTS } from '../mockSettingsData';
import styles from '../SettingsPage.module.scss';

function PaymentCard({ method }: { method: PaymentMethod }) {
  return (
    <div className={`${styles.paymentCard} ${method.isDefault ? styles.paymentCardDefault : ''}`}>
      <div className={styles.paymentIcon}>{method.brand.slice(0, 4)}</div>
      <div className={styles.paymentInfo}>
        <div className={styles.paymentNameRow}>
          <span className={styles.paymentName}>
            {method.brand} •••• {method.last4}
          </span>
          {method.isDefault && <span className={styles.paymentDefaultBadge}>Основная</span>}
        </div>
        <span className={styles.paymentExpiry}>
          Действует до {String(method.exp_month).padStart(2, '0')}/{method.exp_year}
        </span>
      </div>
      <div className={styles.paymentRight}>
        {!method.isDefault && (
          <button type="button" className={`${styles.btnSecondary} ${styles.btnSmall}`}>
            Сделать основной
          </button>
        )}
        <button type="button" className={`${styles.btnDanger} ${styles.btnSmall}`}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

export function PaymentSection() {
  const payments = MOCK_PAYMENTS;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Способы оплаты</h2>
      <p className={styles.sectionSubtitle}>Управление привязанными картами</p>

      <div className={styles.paymentsList}>
        {payments.map((pm) => (
          <PaymentCard key={pm.id} method={pm} />
        ))}
      </div>

      <div className={styles.btnRow}>
        <button type="button" className={styles.btnSecondary}>
          <Plus size={14} />
          <span>Добавить карту</span>
        </button>
      </div>
    </div>
  );
}
