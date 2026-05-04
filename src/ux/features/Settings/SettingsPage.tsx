'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  Camera,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Mail,
  Monitor,
  Phone,
  Plus,
  Shield,
  Smartphone,
  Trash2,
  User,
} from 'lucide-react';
import type {
  SettingsTab,
  ProfileFormData,
  PasswordFormData,
  NotificationToggles,
  ActiveSession,
  PaymentMethod,
} from './types';
import {
  MOCK_PROFILE,
  MOCK_NOTIFICATIONS,
  MOCK_SESSIONS,
  MOCK_PAYMENTS,
} from './mockSettingsData';
import { formatDate, ROUTES } from '@/ux/utils';
import styles from './SettingsPage.module.scss';

/* ─── Sidebar items ─── */

const SIDEBAR_ITEMS: { tab: SettingsTab; icon: React.ReactNode; label: string }[] = [
  { tab: 'profile', icon: <User size={18} />, label: 'Личные данные' },
  { tab: 'security', icon: <Lock size={18} />, label: 'Вход и безопасность' },
  { tab: 'notifications', icon: <Bell size={18} />, label: 'Уведомления' },
  { tab: 'payment', icon: <CreditCard size={18} />, label: 'Способы оплаты' },
  { tab: 'privacy', icon: <Shield size={18} />, label: 'Конфиденциальность' },
];

/* ─── Notification meta ─── */

const NOTIF_META: Record<string, { label: string; hint: string }> = {
  new_deal: { label: 'Запросы на аренду', hint: 'Когда кто-то хочет арендовать вашу вещь' },
  deal_status_changed: { label: 'Статус аренды', hint: 'Когда меняется статус вашей аренды' },
  new_message: { label: 'Сообщения', hint: 'Уведомлять о новых сообщениях в чатах' },
  review_received: { label: 'Отзывы', hint: 'Уведомлять о новых отзывах на ваши объявления' },
  payment_status: { label: 'Платежи', hint: 'Уведомлять о статусе платежей и выплат' },
};

/* ─── Helpers ─── */

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SettingsPage
   ═══════════════════════════════════════════════════════════════════════════════ */
export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile');

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href={ROUTES.profile} className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Назад в профиль</span>
        </Link>

        <h1 className={styles.pageTitle}>Настройки</h1>
        <p className={styles.pageSubtitle}>Управляйте своим аккаунтом и предпочтениями</p>

        <div className={styles.layout}>
          {/* ── Sidebar ── */}
          <nav className={styles.sidebar}>
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.tab}
                type="button"
                className={`${styles.sidebarItem} ${tab === item.tab ? styles.sidebarItemActive : ''}`}
                onClick={() => setTab(item.tab)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* ── Content ── */}
          <div>
            {tab === 'profile' && <ProfileSection />}
            {tab === 'security' && <SecuritySection />}
            {tab === 'notifications' && <NotificationsSection />}
            {tab === 'payment' && <PaymentSection />}
            {tab === 'privacy' && <PrivacySection />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Profile Section ═══ */
function ProfileSection() {
  const [form, setForm] = useState<ProfileFormData>(MOCK_PROFILE);

  const set = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const initials = form.full_name
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
        {form.avatar_url ? (
          <img src={form.avatar_url} alt="" className={styles.avatarPreviewImg} />
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
            {form.avatar_url && (
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
            value={form.full_name}
            onChange={(e) => set('full_name', e.target.value)}
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

/* ═══ Security Section ═══ */
function SecuritySection() {
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
        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
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
        <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
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

function SessionCard({ session }: { session: ActiveSession }) {
  const PlatformIcon = session.platform === 'mobile' ? Smartphone : Monitor;

  return (
    <div className={`${styles.sessionCard} ${session.isCurrent ? styles.sessionCardCurrent : ''}`}>
      <div className={`${styles.sessionIcon} ${session.isCurrent ? styles.sessionIconCurrent : ''}`}>
        <PlatformIcon size={20} />
      </div>
      <div className={styles.sessionInfo}>
        <div className={styles.sessionNameRow}>
          <span className={styles.sessionName}>{session.device_name}</span>
          {session.isCurrent && <span className={styles.sessionCurrentBadge}>Текущая</span>}
        </div>
        <span className={styles.sessionDevice}>{session.device_info}</span>
      </div>
      <div className={styles.sessionRight}>
        <span className={styles.sessionTime}>{relativeTime(session.last_active)}</span>
        {!session.isCurrent && (
          <button type="button" className={`${styles.btnDanger} ${styles.btnSmall}`}>
            <LogOut size={12} />
            <span>Завершить</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══ Notifications Section ═══ */
function NotificationsSection() {
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

/* ═══ Payment Section ═══ */
function PaymentSection() {
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

/* ═══ Privacy Section ═══ */
function PrivacySection() {
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
          className={`${styles.toggle} ${showPhone ? styles.toggleOn : ''}`}
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
          className={`${styles.toggle} ${showEmail ? styles.toggleOn : ''}`}
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
          className={`${styles.toggle} ${showOnline ? styles.toggleOn : ''}`}
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
