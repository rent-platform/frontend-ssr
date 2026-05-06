'use client';

import { useState } from 'react';
import { Camera, Mail, Phone, Trash2 } from 'lucide-react';
import type { ProfileFormData } from '../types';
import { MOCK_PROFILE } from '../mockSettingsData';
import styles from '../SettingsPage.module.scss';

export function ProfileSection() {
  const [form, setForm] = useState<ProfileFormData>(MOCK_PROFILE);

  const set = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const initials = form.fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Личные данные</h2>
      <p className={styles.sectionSubtitle}>Обновите свою персональную информацию</p>

      {/* Avatar */}
      <div className={styles.avatarUpload}>
        {form.avatarUrl ? (
          <img src={form.avatarUrl} alt="" className={styles.avatarPreviewImg} />
        ) : (
          <div className={styles.avatarPreview}>{initials}</div>
        )}
        <div className={styles.avatarActions}>
          <span className={styles.avatarActionsTitle}>Фото профиля</span>
          <span className={styles.avatarActionsHint}>JPG, PNG или WebP. Макс. 5 МБ</span>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" className={`${styles.btnSecondary} ${styles.btnSmall}`}>
              <Camera size={14} />
              <span>Загрузить</span>
            </button>
            {form.avatarUrl && (
              <button type="button" className={`${styles.btnDanger} ${styles.btnSmall}`}>
                <Trash2 size={14} />
                <span>Удалить</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Имя и фамилия</label>
          <input
            className={styles.formInput}
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            placeholder="Ваше имя"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Никнейм</label>
          <input
            className={styles.formInput}
            value={form.nickname}
            onChange={(e) => set('nickname', e.target.value)}
            placeholder="username"
          />
          <span className={styles.formHint}>Отображается в профиле как @{form.nickname || '...'}</span>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email</label>
          <div className={styles.formInputWithIcon}>
            <Mail size={16} />
            <input
              className={styles.formInput}
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Телефон</label>
          <div className={styles.formInputWithIcon}>
            <Phone size={16} />
            <input
              className={styles.formInput}
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
        </div>

        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
          <label className={styles.formLabel}>О себе</label>
          <textarea
            className={styles.formTextarea}
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            placeholder="Расскажите о себе..."
            rows={3}
          />
          <span className={styles.formHint}>{form.bio.length}/300 символов</span>
        </div>
      </div>

      <div className={styles.btnRow}>
        <button type="button" className={styles.btnPrimary}>Сохранить изменения</button>
        <button type="button" className={styles.btnSecondary} onClick={() => setForm(MOCK_PROFILE)}>
          Отменить
        </button>
      </div>
    </div>
  );
}
