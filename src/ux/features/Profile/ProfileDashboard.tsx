'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  Camera,
  Eye,
  Handshake,
  ImageIcon,
  LayoutGrid,
  Mail,
  Package,
  Phone,
  ShoppingBag,
  Star,
  Upload,
  User,
} from 'lucide-react';
import type { ItemStatus, DealStatus } from '@/business/types/entity';
import type { ProfileTab, ProfileListing, ProfileBooking, BookingSide } from './types';
import { MOCK_USER, MOCK_STATS, MOCK_LISTINGS, MOCK_BOOKINGS } from './mockProfileData';
import styles from './ProfileDashboard.module.scss';

/* ─── Helpers ─── */

const ITEM_STATUS_MAP: Record<ItemStatus, { label: string; cls: string }> = {
  active:     { label: 'Активно',      cls: styles.statusActive },
  moderation: { label: 'На модерации', cls: styles.statusModeration },
  draft:      { label: 'Черновик',     cls: styles.statusDraft },
  archived:   { label: 'В архиве',     cls: styles.statusArchived },
  rejected:   { label: 'Отклонено',    cls: styles.statusRejected },
};

const DEAL_STATUS_MAP: Record<DealStatus, { label: string; cls: string }> = {
  new:       { label: 'Новая',       cls: styles.statusNew },
  confirmed: { label: 'Подтверждена', cls: styles.statusConfirmed },
  active:    { label: 'Активна',     cls: styles.statusActive },
  completed: { label: 'Завершена',   cls: styles.statusCompleted },
  rejected:  { label: 'Отклонена',   cls: styles.statusRejected },
};

type ListingFilter = 'all' | ItemStatus;
type BookingFilter = 'all' | DealStatus;

const LISTING_FILTERS: { value: ListingFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'moderation', label: 'Модерация' },
  { value: 'draft', label: 'Черновики' },
  { value: 'archived', label: 'Архив' },
];

const BOOKING_FILTERS: { value: BookingFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'confirmed', label: 'Подтверждённые' },
  { value: 'completed', label: 'Завершённые' },
  { value: 'rejected', label: 'Отклонённые' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ProfileDashboard
   ═══════════════════════════════════════════════════════════════════════════════ */
export function ProfileDashboard() {
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [listingFilter, setListingFilter] = useState<ListingFilter>('all');
  const [outFilter, setOutFilter] = useState<BookingFilter>('all');
  const [inFilter, setInFilter] = useState<BookingFilter>('all');

  const user = MOCK_USER;
  const stats = MOCK_STATS;

  const initials = user.full_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Back Button ── */}
        <Link href="/dev-ui" className={styles.backLink}>
          <ArrowLeft size={18} />
          <span>На главную</span>
        </Link>

        {/* ── Profile Header (Hero Card) ── */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarRing}>
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>{initials}</div>
              )}
            </div>
            <div className={styles.onlineIndicator} />
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.profileNameRow}>
              <h1 className={styles.profileName}>{user.full_name}</h1>
              {user.nickname && (
                <span className={styles.profileNickname}>@{user.nickname}</span>
              )}
            </div>

            {user.bio && <p className={styles.profileBio}>{user.bio}</p>}

            <div className={styles.profileMeta}>
              <Link href="/dev-ui/reviews" className={styles.ratingBadge}>
                <Star size={12} />
                {user.rating.toFixed(1)} · {user.reviewCount} отзывов
              </Link>
              <span className={styles.profileMetaItem}>
                <Calendar size={13} />
                С {formatDate(user.memberSince)}
              </span>
              {user.phone && (
                <span className={styles.profileMetaItem}>
                  <Phone size={13} />
                  {user.phone}
                </span>
              )}
              {user.email && (
                <span className={styles.profileMetaItem}>
                  <Mail size={13} />
                  {user.email}
                </span>
              )}
            </div>
          </div>

          <div className={styles.inlineStats}>
            <div className={styles.inlineStat}>
              <span className={styles.inlineStatValue}>{stats.activeListings}</span>
              <span className={styles.inlineStatLabel}>Объявлений</span>
            </div>
            <div className={styles.inlineStatDivider} />
            <div className={styles.inlineStat}>
              <span className={styles.inlineStatValue}>{stats.completedBookings}</span>
              <span className={styles.inlineStatLabel}>Сдал</span>
            </div>
            <div className={styles.inlineStatDivider} />
            <div className={styles.inlineStat}>
              <span className={styles.inlineStatValue}>{stats.rentedCount}</span>
              <span className={styles.inlineStatLabel}>Арендовал</span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className={styles.tabs}>
          <TabBtn
            active={tab === 'overview'}
            icon={<User size={16} />}
            label="Профиль"
            onClick={() => setTab('overview')}
          />
          <TabBtn
            active={tab === 'listings'}
            icon={<LayoutGrid size={16} />}
            label="Объявления"
            badge={stats.totalListings}
            onClick={() => setTab('listings')}
          />
          <TabBtn
            active={tab === 'renting-out'}
            icon={<Upload size={16} />}
            label="Сдаю в аренду"
            badge={MOCK_BOOKINGS.filter((b) => b.side === 'owner').length}
            onClick={() => setTab('renting-out')}
          />
          <TabBtn
            active={tab === 'renting-in'}
            icon={<ShoppingBag size={16} />}
            label="Арендую"
            badge={MOCK_BOOKINGS.filter((b) => b.side === 'renter').length}
            onClick={() => setTab('renting-in')}
          />
        </div>

        {/* ── Tab Content ── */}
        {tab === 'overview' && <OverviewPanel />}
        {tab === 'listings' && (
          <ListingsPanel filter={listingFilter} onFilterChange={setListingFilter} />
        )}
        {tab === 'renting-out' && (
          <BookingsPanel
            side="owner"
            title="Сдаю в аренду"
            subtitle="Вещи, которые вы сдаёте другим"
            filter={outFilter}
            onFilterChange={setOutFilter}
          />
        )}
        {tab === 'renting-in' && (
          <BookingsPanel
            side="renter"
            title="Арендую"
            subtitle="Вещи, которые вы берёте у других"
            filter={inFilter}
            onFilterChange={setInFilter}
          />
        )}
      </div>
    </div>
  );
}

/* ═══ Stat Card ═══ */
function StatCard({
  icon,
  iconCls,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconCls: string;
  value: string;
  label: string;
}) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${iconCls}`}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

/* ═══ Tab Button ═══ */
function TabBtn({
  active,
  icon,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.tab} ${active ? styles.tabActive : ''}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && (
        <span className={`${styles.tabBadge} ${!active ? styles.tabBadgeInactive : ''}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

/* ═══ Overview Panel ═══ */
function OverviewPanel() {
  const user = MOCK_USER;
  const stats = MOCK_STATS;
  const ownerDeals = MOCK_BOOKINGS.filter((b) => b.side === 'owner');
  const renterDeals = MOCK_BOOKINGS.filter((b) => b.side === 'renter');

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Обзор профиля</h2>
          <p className={styles.panelSubtitle}>Статистика как арендодателя и арендатора</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          icon={<Package size={20} />}
          iconCls={styles.statIconGreen}
          value={`${stats.activeListings} / ${stats.totalListings}`}
          label="Объявлений (акт. / всего)"
        />
        <StatCard
          icon={<Upload size={20} />}
          iconCls={styles.statIconBlue}
          value={`${ownerDeals.length}`}
          label="Сдал в аренду"
        />
        <StatCard
          icon={<ShoppingBag size={20} />}
          iconCls={styles.statIconPurple}
          value={`${renterDeals.length}`}
          label="Арендовал у других"
        />
        <Link href="/dev-ui/reviews" style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatCard
            icon={<Star size={20} />}
            iconCls={styles.statIconAmber}
            value={user.rating.toFixed(1)}
            label={`${user.reviewCount} отзывов →`}
          />
        </Link>
      </div>
    </div>
  );
}

/* ═══ Listings Panel ═══ */
function ListingsPanel({
  filter,
  onFilterChange,
}: {
  filter: ListingFilter;
  onFilterChange: (f: ListingFilter) => void;
}) {
  const filtered = useMemo(
    () =>
      filter === 'all'
        ? MOCK_LISTINGS
        : MOCK_LISTINGS.filter((l) => l.status === filter),
    [filter],
  );

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Мои объявления</h2>
          <p className={styles.panelSubtitle}>
            {filtered.length} {pluralize(filtered.length, 'объявление', 'объявления', 'объявлений')}
          </p>
        </div>
        <div className={styles.filterPills}>
          {LISTING_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`${styles.filterPill} ${filter === f.value ? styles.filterPillActive : ''}`}
              onClick={() => onFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Package />} title="Нет объявлений" text="В этой категории пока ничего нет" />
      ) : (
        <div className={styles.listingsGrid}>
          {filtered.map((item) => (
            <ListingRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListingRow({ item }: { item: ProfileListing }) {
  const st = ITEM_STATUS_MAP[item.status];
  return (
    <div className={styles.listingRow}>
      {item.image ? (
        <img src={item.image} alt={item.title} className={styles.listingImage} />
      ) : (
        <div className={styles.listingImagePlaceholder}>
          <ImageIcon size={24} />
        </div>
      )}

      <div className={styles.listingInfo}>
        <h3 className={styles.listingTitle}>{item.title}</h3>
        <div className={styles.listingMeta}>
          <span className={styles.listingMetaItem}>
            <LayoutGrid size={12} />
            {item.category}
          </span>
          <span className={styles.listingMetaItem}>
            <Eye size={12} />
            {item.views_count}
          </span>
          <span className={styles.listingMetaItem}>
            <CalendarCheck size={12} />
            {item.bookingsCount} бронир.
          </span>
          <span className={styles.listingMetaItem}>
            <Calendar size={12} />
            {formatDate(item.created_at)}
          </span>
        </div>
      </div>

      <span className={`${styles.statusBadge} ${st.cls}`}>{st.label}</span>

      {item.price_per_day && (
        <div className={styles.listingPrice}>
          {item.price_per_day} ₽
          <span className={styles.listingPriceUnit}>/сут</span>
        </div>
      )}
    </div>
  );
}

/* ═══ Bookings Panel ═══ */
function BookingsPanel({
  side,
  title,
  subtitle,
  filter,
  onFilterChange,
}: {
  side: BookingSide;
  title: string;
  subtitle: string;
  filter: BookingFilter;
  onFilterChange: (f: BookingFilter) => void;
}) {
  const filtered = useMemo(() => {
    const bySide = MOCK_BOOKINGS.filter((b) => b.side === side);
    return filter === 'all' ? bySide : bySide.filter((b) => b.status === filter);
  }, [side, filter]);

  const counterLabel = side === 'owner' ? 'Арендатор' : 'Владелец';

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>{title}</h2>
          <p className={styles.panelSubtitle}>
            {subtitle} · {filtered.length} {pluralize(filtered.length, 'сделка', 'сделки', 'сделок')}
          </p>
        </div>
        <div className={styles.filterPills}>
          {BOOKING_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`${styles.filterPill} ${filter === f.value ? styles.filterPillActive : ''}`}
              onClick={() => onFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={side === 'owner' ? <Upload /> : <ShoppingBag />}
          title={side === 'owner' ? 'Нет сделок по аренде' : 'Вы ещё ничего не арендовали'}
          text="В этой категории пока ничего нет"
        />
      ) : (
        <div className={styles.bookingsGrid}>
          {filtered.map((b) => (
            <BookingRow key={b.id} booking={b} counterLabel={counterLabel} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking, counterLabel }: { booking: ProfileBooking; counterLabel: string }) {
  const st = DEAL_STATUS_MAP[booking.status];

  return (
    <div className={styles.bookingRow}>
      {booking.itemImage ? (
        <img src={booking.itemImage} alt={booking.itemTitle} className={styles.bookingImage} />
      ) : (
        <div className={styles.listingImagePlaceholder}>
          <Camera size={24} />
        </div>
      )}

      <div className={styles.bookingInfo}>
        <span className={styles.bookingTitle}>{booking.itemTitle}</span>
        <div className={styles.bookingMeta}>
          <span className={styles.bookingMetaItem}>
            <User size={12} />
            {counterLabel}: {booking.counterpartyName}
          </span>
          <span className={styles.bookingMetaItem}>
            <Calendar size={12} />
            {formatShortDate(booking.start_date)} — {formatShortDate(booking.end_date)}
          </span>
        </div>
      </div>

      <div className={styles.bookingRight}>
        <span className={styles.bookingPrice}>{booking.total_price} ₽</span>
        <span className={`${styles.statusBadge} ${st.cls}`}>{st.label}</span>
      </div>
    </div>
  );
}

/* ═══ Empty State ═══ */
function EmptyState({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
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
