'use client';

import { useState } from 'react';
import {
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Smartphone,
} from 'lucide-react';
import clsx from 'clsx';
import { timeAgo } from '@/ux/utils';
import type { PasswordFormData, ActiveSession } from '../types';
import { MOCK_PROFILE, MOCK_SESSIONS } from '../mockSettingsData';
import styles from '../SettingsPage.module.scss';

function SessionCard({ session }: { session: ActiveSession }) {
  const PlatformIcon = session.platform === 'mobile' ? Smartphone : Monitor;

  return (
    <div className={clsx(styles.sessionCard, session.isCurrent && styles.sessionCardCurrent)}>
      <div className={clsx(styles.sessionIcon, session.isCurrent && styles.sessionIconCurrent)}>
        <PlatformIcon size={20} />
      </div>
      <div className={styles.sessionInfo}>
        <div className={styles.sessionNameRow}>
          <span className={styles.sessionName}>{session.deviceName}</span>
          {session.isCurrent && <span className={styles.sessionCurrentBadge}>Текущая</span>}
        </div>
        <span className={styles.sessionDevice}>{session.deviceInfo}</span>
      </div>
      <div className={styles.sessionRight}>
        <span className={styles.sessionTime}>{timeAgo(session.lastActive)}</span>
        {!session.isCurrent && (
          <button type="button" className={clsx(styles.btnDanger, styles.btnSmall)}>
            <LogOut size={12} />
            <span>Завершить</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function SecuritySection() {
  const [email, setEmail] = useState(MOCK_PROFILE.email);
  const [pw, setPw] = useState<PasswordFormData>({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const sessions = MOCK_SESSIONS;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Вход и безопасность</h2>
      <p className={styles.sectionSubtitle}>Пароль, email и устройства</p>

      {/* Password */}
      <h3 className={styles.sectionTitle}>Пароль</h3>
      <p className={styles.sectionSubtitle}>Смена пароля для входа в аккаунт</p>

      <div className={styles.formGrid}>
        <div className={clsx(styles.formGroup, styles.formGroupFull)}>
          <label className={styles.formLabel}>Текущий пароль</label>
          <div className={styles.formInputWithIcon}>
            <KeyRound size={16} />
            <input
              className={styles.formInput}
              type={showCurrent ? 'text' : 'password'}
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Новый пароль</label>
          <div className={styles.formInputWithIcon}>
            <Lock size={16} />
            <input
              className={styles.formInput}
              type={showNext ? 'text' : 'password'}
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              placeholder="Минимум 8 символов"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Подтвердите пароль</label>
          <div className={styles.formInputWithIcon}>
            <Lock size={16} />
            <input
              className={styles.formInput}
              type={showNext ? 'text' : 'password'}
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="Повторите пароль"
            />
          </div>
        </div>
      </div>

      <div className={styles.btnRow}>
        <button type="button" className={styles.btnPrimary}>Обновить пароль</button>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => {
            setShowCurrent((v) => !v);
            setShowNext((v) => !v);
          }}
        >
          {showNext ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{showNext ? 'Скрыть' : 'Показать'}</span>
        </button>
      </div>

      <div className={styles.sectionDivider} />

      {/* Email */}
      <h3 className={styles.sectionTitle}>Email</h3>
      <p className={styles.sectionSubtitle}>Ваш текущий email: <strong>{MOCK_PROFILE.email}</strong></p>

      <div className={styles.formGrid}>
        <div className={clsx(styles.formGroup, styles.formGroupFull)}>
          <label className={styles.formLabel}>Новый адрес электронной почты</label>
          <div className={styles.formInputWithIcon}>
            <Mail size={16} />
            <input
              className={styles.formInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="new-email@example.com"
            />
          </div>
          <span className={styles.formHint}>После изменения потребуется подтверждение по ссылке в письме</span>
        </div>
      </div>

      <div className={styles.btnRow}>
        <button type="button" className={styles.btnPrimary}>Сохранить email</button>
      </div>

      <div className={styles.sectionDivider} />

      {/* Sessions */}
      <h3 className={styles.sectionTitle}>Активные сессии</h3>
      <p className={styles.sectionSubtitle}>Устройства, на которых выполнен вход</p>

      <div className={styles.sessionsList}>
        {sessions.map((s) => (
          <SessionCard key={s.id} session={s} />
        ))}
      </div>

      <div className={styles.btnRow}>
        <button type="button" className={styles.btnDanger}>
          <LogOut size={14} />
          <span>Завершить все другие сессии</span>
        </button>
      </div>
    </div>
  );
}
