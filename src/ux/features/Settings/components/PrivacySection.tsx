'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import clsx from 'clsx';
import styles from '../SettingsPage.module.scss';

export function PrivacySection() {
  const [showPhone, setShowPhone] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showOnline, setShowOnline] = useState(true);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Конфиденциальность</h2>
      <p className={styles.sectionSubtitle}>Управляйте видимостью ваших данных</p>

      <div className={styles.toggleRow}>
        <div className={styles.toggleInfo}>
          <span className={styles.toggleLabel}>Показывать телефон</span>
          <span className={styles.toggleHint}>Другие пользователи смогут видеть ваш номер телефона</span>
        </div>
        <button
          type="button"
          className={clsx(styles.toggle, showPhone && styles.toggleOn)}
          onClick={() => setShowPhone((v) => !v)}
        />
      </div>

      <div className={styles.toggleRow}>
        <div className={styles.toggleInfo}>
          <span className={styles.toggleLabel}>Показывать email</span>
          <span className={styles.toggleHint}>Другие пользователи смогут видеть ваш email</span>
        </div>
        <button
          type="button"
          className={clsx(styles.toggle, showEmail && styles.toggleOn)}
          onClick={() => setShowEmail((v) => !v)}
        />
      </div>

      <div className={styles.toggleRow}>
        <div className={styles.toggleInfo}>
          <span className={styles.toggleLabel}>Статус «В сети»</span>
          <span className={styles.toggleHint}>Показывать индикатор онлайн-присутствия</span>
        </div>
        <button
          type="button"
          className={clsx(styles.toggle, showOnline && styles.toggleOn)}
          onClick={() => setShowOnline((v) => !v)}
        />
      </div>

      <div className={styles.btnRow}>
        <button type="button" className={styles.btnPrimary}>Сохранить</button>
      </div>

      <div className={styles.sectionDivider} />

      {/* Danger Zone */}
      <div className={styles.dangerZone}>
        <h3 className={styles.dangerZoneTitle}>Удаление аккаунта</h3>
        <p className={styles.dangerZoneText}>
          Удаление аккаунта необратимо. Все ваши объявления, сделки и данные будут удалены навсегда.
        </p>
        <button type="button" className={styles.btnDanger}>
          <Trash2 size={14} />
          <span>Удалить аккаунт</span>
        </button>
      </div>
    </div>
  );
}
