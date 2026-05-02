'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  Mail,
  Package,
  Phone,
  Share2,
  Shield,
  ShoppingBag,
  Star,
  Upload,
  User,
  X,
  Zap,
} from 'lucide-react';
import { CatalogHeader } from '../Catalog/components/CatalogHeader';
import { CatalogFooter } from '../Catalog/components/CatalogFooter';
import { CatalogCard } from '../Catalog/components/CatalogCard';
import type { CatalogUiItem } from '../Catalog/types';
import type { ItemStatus, DealStatus } from '@/business/types/entity';
import type { ProfileTab, ProfileListing, ProfileBooking, BookingSide } from './types';
import { MOCK_USER, MOCK_STATS, MOCK_LISTINGS, MOCK_BOOKINGS } from './mockProfileData';
import styles from './ProfileDashboard.module.scss';

/* ─── Helpers ─── */

const DEAL_STATUS_MAP: Record<DealStatus, { label: string; cls: string }> = {
  new:       { label: 'Ожидает',     cls: styles.statusNew },
  confirmed: { label: 'Подтверждена', cls: styles.statusConfirmed },
  active:    { label: 'Активна',     cls: styles.statusActive },
  completed: { label: 'Завершена',   cls: styles.statusCompleted },
  rejected:  { label: 'Отклонена',   cls: styles.statusRejected },
  cancelled: { label: 'Отменена',    cls: styles.statusArchived },
};

type ListingFilter = 'all' | ItemStatus;
type BookingFilter = 'all' | DealStatus;

const LISTING_FILTERS: { value: ListingFilter; label: string; tip: string }[] = [
  { value: 'all', label: 'Все', tip: 'Показать все объявления' },
  { value: 'active', label: 'Активные', tip: 'Опубликованы и доступны для аренды' },
  { value: 'moderation', label: 'Модерация', tip: 'На проверке модератором' },
  { value: 'draft', label: 'Черновики', tip: 'Незавершённые объявления' },
  { value: 'archived', label: 'Архив', tip: 'Снятые с публикации' },
];

const BOOKING_FILTERS: { value: BookingFilter; label: string; tip: string }[] = [
  { value: 'all', label: 'Все', tip: 'Показать все аренды' },
  { value: 'active', label: 'Активные', tip: 'Вещь сейчас у арендатора' },
  { value: 'confirmed', label: 'Подтверждённые', tip: 'Ожидают начала аренды' },
  { value: 'completed', label: 'Завершённые', tip: 'Аренда успешно завершена' },
  { value: 'rejected', label: 'Отклонённые', tip: 'Запрос на аренду отклонён' },
];

const EASE = [0.23, 1, 0.32, 1] as const;

function profileListingToCatalogItem(listing: ProfileListing): CatalogUiItem {
  return {
    id: listing.id,
    title: listing.title,
    coverImageUrl: listing.image ?? '',
    images: listing.image ? [listing.image] : [],
    category: listing.category,
    pricePerDay: listing.price_per_day ?? null,
    pricePerHour: null,
    depositAmount: '',
    pickupLocation: 'Новосибирск',
    status: listing.status,
    isAvailable: listing.status === 'active',
    viewsCount: listing.views_count,
    createdAt: listing.created_at,
    nearestAvailableDate: null,
    ownerName: MOCK_USER.full_name,
    ownerAvatar: MOCK_USER.avatar_url,
    ownerRating: MOCK_USER.rating,
    quickFilters: [],
    featured: listing.bookingsCount > 10,
  } as CatalogUiItem;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function getProfileCompletion(user: typeof MOCK_USER): number {
  let score = 0;
  if (user.avatar_url) score += 20;
  if (user.bio) score += 20;
  if (user.phone) score += 20;
  if (user.email) score += 20;
  if (user.nickname) score += 10;
  score += 10; // base
  return Math.min(score, 100);
}

/* ── Skeleton placeholder ── */
function DashboardSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.skeletonBar}><div className={styles.shimmer} style={{ width: 140, height: 24, borderRadius: 6 }} /></div>
      <div className={styles.skeletonWrap}>
        <div className={styles.skeletonCard}>
          <div style={{ display: 'flex', gap: 16, padding: '24px 24px 16px' }}>
            <div className={styles.shimmer} style={{ width: 64, height: 64, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className={styles.shimmer} style={{ width: 180, height: 20, borderRadius: 6 }} />
              <div className={styles.shimmer} style={{ width: 260, height: 13, borderRadius: 4, marginTop: 10 }} />
              <div className={styles.shimmer} style={{ width: 200, height: 13, borderRadius: 4, marginTop: 8 }} />
            </div>
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #e5e7eb' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 14 }}>
                <div className={styles.shimmer} style={{ width: 32, height: 20, borderRadius: 4 }} />
                <div className={styles.shimmer} style={{ width: 48, height: 10, borderRadius: 3 }} />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.shimmer} style={{ width: '100%', height: 44, borderRadius: 0 }} />
        <div className={styles.skeletonCard} style={{ padding: 24 }}>
          <div className={styles.shimmer} style={{ width: 140, height: 18, borderRadius: 5 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
            {[1, 2, 3].map((i) => <div key={i} className={styles.shimmer} style={{ height: 72, borderRadius: 12 }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Share modal ── */
function ShareModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  }, [url]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modalContent}
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>Поделиться профилем</h3>
          <button type="button" className={styles.modalClose} onClick={onClose}><X size={18} /></button>
        </div>
        <p className={styles.modalDesc}>Скопируйте ссылку и поделитесь с друзьями</p>
        <div className={styles.modalCopyRow}>
          <input type="text" readOnly value={url} className={styles.modalInput} />
          <button type="button" className={styles.modalCopyBtn} onClick={handleCopy}>
            {copied ? <><Check size={14} /> Скопировано</> : <><Copy size={14} /> Копировать</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ProfileDashboard
   ═══════════════════════════════════════════════════════════════════════════════ */
export function ProfileDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<ProfileTab>('listings');
  const [listingFilter, setListingFilter] = useState<ListingFilter>('all');
  const [dealSide, setDealSide] = useState<BookingSide>('owner');
  const [dealFilter, setDealFilter] = useState<BookingFilter>('all');
  const [showShareModal, setShowShareModal] = useState(false);

  const user = MOCK_USER;
  const stats = MOCK_STATS;

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const initials = user.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  const profileCompletion = getProfileCompletion(user);
  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/dev-ui/user/${user.id}`
    : `https://arendai.ru/user/${user.id}`;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className={styles.page}>
      <CatalogHeader cityLabel="Новосибирск" />

      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/dev-ui" className={styles.backLink}><ArrowLeft size={15} /> Каталог</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Мой профиль</span>
        </div>
      </div>

      <main className={styles.container}>
        {/* ── Profile Card ── */}
        <motion.section
          className={styles.profileCard}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <div className={styles.profileHeader}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatarRing}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarFallback}>{initials}</div>
                )}
              </div>
              <button type="button" className={styles.avatarEdit} aria-label="Изменить фото">
                <Camera size={11} />
              </button>
            </div>

            <div className={styles.nameBlock}>
              <div className={styles.nameRow}>
                <h1>{user.full_name}</h1>
                <BadgeCheck size={18} className={styles.verifiedBadge} />
              </div>
              {user.nickname && <span className={styles.nickname}>@{user.nickname}</span>}
            </div>

            <div className={styles.profileActions}>
              <Link href="/dev-ui/settings" className={styles.btnPrimary}>
                <Edit3 size={15} /> Редактировать
              </Link>
              <button type="button" className={styles.btnIcon} onClick={() => setShowShareModal(true)} title="Поделиться">
                <Share2 size={17} />
              </button>
              <Link href={`/dev-ui/user/${user.id}`} className={styles.btnIcon} title="Публичный профиль">
                <Eye size={17} />
              </Link>
            </div>
          </div>

          <div className={styles.profileBody}>
            {user.bio && <p className={styles.bio}>{user.bio}</p>}

            <div className={styles.metaRow}>
              <Link href="/dev-ui/reviews" className={styles.ratingChip}>
                <Star size={13} />
                {user.rating.toFixed(1)}
                <span className={styles.ratingCount}>({user.reviewCount} {pluralize(user.reviewCount, 'отзыв', 'отзыва', 'отзывов')})</span>
              </Link>
              <span className={styles.metaDot}>·</span>
              <span className={styles.metaItem}><Calendar size={13} /> С {formatDate(user.memberSince)}</span>
              {user.phone && <><span className={styles.metaDot}>·</span><span className={styles.metaItem}><Phone size={13} /> {user.phone}</span></>}
            </div>

            <div className={styles.verifyRow}>
              <VerifyChip icon={<CheckCircle2 size={13} />} label="Телефон" done tooltip="Номер телефона подтверждён" />
              <VerifyChip icon={<Mail size={13} />} label="Email" done tooltip="Электронная почта подтверждена" />
              <VerifyChip icon={<Shield size={13} />} label="Паспорт" done={false} tooltip="Пройдите верификацию документа" />
              <VerifyChip icon={<BadgeCheck size={13} />} label="Фото" done tooltip="Фото профиля подтверждено" />
            </div>
          </div>

          {profileCompletion < 100 && (
            <div className={styles.completionStrip}>
              <Zap size={14} />
              <span>Профиль заполнен на <strong>{profileCompletion}%</strong></span>
              <div className={styles.completionTrack}>
                <div className={styles.completionFill} style={{ width: `${profileCompletion}%` }} />
              </div>
              <Link href="/dev-ui/settings" className={styles.completionLink}>Заполнить →</Link>
            </div>
          )}

          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.tooltipWrap}`}>
              <span className={styles.statNum}>{stats.activeListings}</span>
              <span className={styles.statLbl}>Объявлений</span>
              <span className={styles.tooltipBubble}>Активных объявлений на платформе</span>
            </div>
            <div className={`${styles.statCard} ${styles.tooltipWrap}`}>
              <span className={styles.statNum}>{stats.completedBookings}</span>
              <span className={styles.statLbl}>Сдано</span>
              <span className={styles.tooltipBubble}>Успешных сдач в аренду</span>
            </div>
            <div className={`${styles.statCard} ${styles.tooltipWrap}`}>
              <span className={styles.statNum}>{stats.rentedCount}</span>
              <span className={styles.statLbl}>Арендовано</span>
              <span className={styles.tooltipBubble}>Вещей взято в аренду</span>
            </div>
            <div className={`${styles.statCard} ${styles.tooltipWrap}`}>
              <span className={`${styles.statNum} ${styles.statNumAccent}`}>{user.rating.toFixed(1)}</span>
              <span className={styles.statLbl}>Рейтинг</span>
              <span className={styles.tooltipBubble}>Средняя оценка от пользователей</span>
            </div>
          </div>
        </motion.section>

        {/* ── Tabs ── */}
        <motion.nav
          className={styles.tabBar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1, ease: EASE }}
        >
          <TabBtn active={tab === 'listings'} label="Мои объявления" count={stats.totalListings} onClick={() => setTab('listings')} tooltip="Вещи, которые вы выставили на аренду" />
          <TabBtn active={tab === 'deals'} label="Мои аренды" count={MOCK_BOOKINGS.length} onClick={() => setTab('deals')} tooltip="История сдачи и аренды вещей" />
        </motion.nav>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {tab === 'listings' && <ListingsPanel filter={listingFilter} onFilterChange={setListingFilter} />}
            {tab === 'deals' && <DealsPanel side={dealSide} onSideChange={setDealSide} filter={dealFilter} onFilterChange={setDealFilter} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <CatalogFooter />

      <AnimatePresence>
        {showShareModal && <ShareModal url={profileUrl} onClose={() => setShowShareModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ── Verify chip (inline) ── */
function VerifyChip({ icon, label, done, tooltip }: { icon: React.ReactNode; label: string; done: boolean; tooltip: string }) {
  return (
    <span className={`${styles.verifyChip} ${done ? styles.verifyDone : styles.verifyPending} ${styles.tooltipWrap}`}>
      {icon} {label}
      <span className={styles.tooltipBubble}>{tooltip}</span>
    </span>
  );
}

/* ── Tab button (underline style) ── */
function TabBtn({ active, label, count, onClick, tooltip }: { active: boolean; label: string; count?: number; onClick: () => void; tooltip?: string }) {
  return (
    <button type="button" className={`${styles.tab} ${active ? styles.tabActive : ''} ${tooltip ? styles.tooltipWrap : ''}`} onClick={onClick}>
      {label}
      {count !== undefined && <span className={styles.tabCount}>{count}</span>}
      {tooltip && <span className={styles.tooltipBubble}>{tooltip}</span>}
    </button>
  );
}

/* ═══ Listings Panel ═══ */
function ListingsPanel({ filter, onFilterChange }: { filter: ListingFilter; onFilterChange: (f: ListingFilter) => void }) {
  const filtered = useMemo(() => (filter === 'all' ? MOCK_LISTINGS : MOCK_LISTINGS.filter((l) => l.status === filter)), [filter]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Мои объявления</h2>
          <p className={styles.panelSubtitle}>{filtered.length} {pluralize(filtered.length, 'объявление', 'объявления', 'объявлений')}</p>
        </div>
        <div className={styles.filterPills}>
          {LISTING_FILTERS.map((f) => (
            <button key={f.value} type="button" className={`${styles.filterPill} ${filter === f.value ? styles.filterPillActive : ''} ${styles.tooltipWrap}`} onClick={() => onFilterChange(f.value)}>
              {f.label}
              <span className={styles.tooltipBubble}>{f.tip}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Package />} title="Нет объявлений" text="По этому фильтру ничего не найдено" />
      ) : (
        <div className={styles.listingsGrid}>
          {filtered.map((item, i) => (
            <CatalogCard
              key={item.id}
              item={profileListingToCatalogItem(item)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══ Deals Panel (unified) ═══ */
function DealsPanel({ side, onSideChange, filter, onFilterChange }: { side: BookingSide; onSideChange: (s: BookingSide) => void; filter: BookingFilter; onFilterChange: (f: BookingFilter) => void }) {
  const filtered = useMemo(() => {
    const bySide = MOCK_BOOKINGS.filter((b) => b.side === side);
    return filter === 'all' ? bySide : bySide.filter((b) => b.status === filter);
  }, [side, filter]);

  const counterLabel = side === 'owner' ? 'Арендатор' : 'Владелец';

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Мои аренды</h2>
          <p className={styles.panelSubtitle}>
            {side === 'owner' ? 'Вещи, которые вы сдаёте в аренду' : 'Вещи, которые вы арендуете'}
            {' · '}{filtered.length} {pluralize(filtered.length, 'сделка', 'сделки', 'сделок')}
          </p>
        </div>
      </div>

      {/* Side toggle */}
      <div className={styles.sideToggle}>
        <button
          type="button"
          className={`${styles.sideToggleBtn} ${side === 'owner' ? styles.sideToggleBtnActive : ''}`}
          onClick={() => { onSideChange('owner'); onFilterChange('all'); }}
        >
          <Upload size={14} /> Сдаю
        </button>
        <button
          type="button"
          className={`${styles.sideToggleBtn} ${side === 'renter' ? styles.sideToggleBtnActive : ''}`}
          onClick={() => { onSideChange('renter'); onFilterChange('all'); }}
        >
          <ShoppingBag size={14} /> Арендую
        </button>
      </div>

      {/* Status filters */}
      <div className={styles.filterPills}>
        {BOOKING_FILTERS.map((f) => (
          <button key={f.value} type="button" className={`${styles.filterPill} ${filter === f.value ? styles.filterPillActive : ''} ${styles.tooltipWrap}`} onClick={() => onFilterChange(f.value)}>
            {f.label}
            <span className={styles.tooltipBubble}>{f.tip}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={side === 'owner' ? <Upload /> : <ShoppingBag />} title={side === 'owner' ? 'Нет аренд по сдаче' : 'Вы пока ничего не арендовали'} text="По этому фильтру ничего не найдено" />
      ) : (
        <div className={styles.bookingsGrid}>
          {filtered.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}>
              <BookingRow booking={b} counterLabel={counterLabel} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking, counterLabel }: { booking: ProfileBooking; counterLabel: string }) {
  const st = DEAL_STATUS_MAP[booking.status];

  return (
    <div className={styles.bookingCard}>
      <div className={styles.bookingImageArea}>
        <div className={styles.bookingBadgeRow}>
          <span className={`${styles.statusBadge} ${st.cls}`}>{st.label}</span>
        </div>
        {booking.itemImage ? (
          <img src={booking.itemImage} alt={booking.itemTitle} className={styles.bookingImg} />
        ) : (
          <div className={styles.bookingImgFallback}><Camera size={24} /></div>
        )}
      </div>

      <div className={styles.bookingInfo}>
        <div className={styles.bookingTop}>
          <span className={styles.bookingTitle}>{booking.itemTitle}</span>
          <span className={styles.bookingMeta}>
            <User size={14} /> {counterLabel}: {booking.counterpartyName}
          </span>
          <span className={styles.bookingMeta}>
            <Calendar size={14} /> {formatShortDate(booking.start_date)} — {formatShortDate(booking.end_date)}
          </span>
        </div>

        <div className={styles.bookingChips}>
          <span className={styles.bookingChip}>
            <Shield size={12} />
            Залог {Number(booking.deposit_amount).toLocaleString('ru-RU')} ₽
          </span>
        </div>

        <div className={styles.bookingFooter}>
          <div className={styles.bookingPriceBlock}>
            <strong>{Number(booking.total_price).toLocaleString('ru-RU')} ₽</strong>
            <span>за период</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Empty State ═══ */
function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyText}>{text}</p>
    </div>
  );
}

/* ─── Pluralize helper ─── */
function pluralize(n: number, one: string, few: string, many: string) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}
