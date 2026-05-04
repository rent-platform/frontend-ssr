'use client';

import { useState } from 'react';
import type { NotificationToggles } from '../types';
import { MOCK_NOTIFICATIONS } from '../mockSettingsData';
import styles from '../SettingsPage.module.scss';

const NOTIF_META: Record<string, { label: string; hint: string }> = {
  new_deal: { label: 'Запросы на аренду', hint: 'Когда кто-то хочет арендовать вашу вещь' },
  deal_status_changed: { label: 'Статус аренды', hint: 'Когда меняется статус вашей аренды' },
  new_message: { label: 'Сообщения', hint: 'Уведомлять о новых сообщениях в чатах' },
  review_received: { label: 'Отзывы', hint: 'Уведомлять о новых отзывах на ваши объявления' },
  payment_status: { label: 'Платежи', hint: 'Уведомлять о статусе платежей и выплат' },
};

export function NotificationsSection() {
  const [toggles, setToggles] = useState<NotificationToggles>(MOCK_NOTIFICATIONS);

  const flip = (key: keyof NotificationToggles) =>
    setToggles((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Уведомления</h2>
      <p className={styles.sectionSubtitle}>Настройте, о чём вам сообщать</p>

      {(Object.keys(NOTIF_META) as (keyof typeof NOTIF_META)[]).map((key) => {
        const meta = NOTIF_META[key];
        const on = toggles[key as keyof NotificationToggles];
        return (
          <div key={key} className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleLabel}>{meta.label}</span>
              <span className={styles.toggleHint}>{meta.hint}</span>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
              onClick={() => flip(key as keyof NotificationToggles)}
              aria-label={`${meta.label} ${on ? 'выкл' : 'вкл'}`}
            />
          </div>
        );
      })}

      <div className={styles.btnRow}>
        <button type="button" className={styles.btnPrimary}>Сохранить</button>
      </div>
    </div>
  );
}
