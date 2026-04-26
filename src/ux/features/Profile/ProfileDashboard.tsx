'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  CalendarCheck,
  Camera,
  CheckCircle2,
  Edit3,
  Eye,
  Handshake,
  ImageIcon,
  LayoutGrid,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Share2,
  Shield,
  ShoppingBag,
  Star,
  TrendingUp,
  Upload,
  User,
  Zap,
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

const EASE = [0.23, 1, 0.32, 1] as const;

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

        {/* ═══ Hero Section ═══ */}
        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className={styles.heroBanner} />

          <div className={styles.heroBody}>
            {/* Avatar */}
            <div className={styles.avatarSection}>
              <div className={styles.avatarRing}>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarFallback}>{initials}</div>
                )}
              </div>
              <div className={styles.onlineDot} />
              <button type="button" className={styles.avatarEditBtn} aria-label="Изменить фото">
                <Camera size={14} />
              </button>
            </div>

            {/* Info */}
            <div className={styles.heroInfo}>
              <div className={styles.nameRow}>
                <h1>{user.full_name}</h1>
                <BadgeCheck size={20} className={styles.verifiedIcon} />
                {user.nickname && <span className={styles.nickname}>@{user.nickname}</span>}
              </div>

              <div className={styles.metaRow}>
                <Link href="/dev-ui/reviews" className={styles.ratingChip}>
                  <Star size={13} />
                  {user.rating.toFixed(1)}
                  <span className={styles.ratingCount}>({user.reviewCount} отзыва)</span>
                </Link>
                <span className={styles.metaSep}>·</span>
                <span className={styles.metaChip}><Calendar size={13} /> С {formatDate(user.memberSince)}</span>
                {user.phone && <><span className={styles.metaSep}>·</span><span className={styles.metaChip}><Phone size={13} /> {user.phone}</span></>}
                {user.email && <><span className={styles.metaSep}>·</span><span className={styles.metaChip}><Mail size={13} /> {user.email}</span></>}
              </div>
            </div>

            {/* Actions */}
            <div className={styles.heroActions}>
              <Link href="/dev-ui/settings" className={styles.btnPrimary}>
                <Edit3 size={15} /> Редактировать
              </Link>
              <button type="button" className={styles.btnGhost}>
                <Share2 size={15} /> Поделиться
              </button>
            </div>
          </div>

          {/* Counters strip */}
          <div className={styles.counters}>
            <div className={styles.counter}>
              <span className={styles.counterVal}>{stats.activeListings}</span>
              <span className={styles.counterLbl}>Объявлений</span>
            </div>
            <div className={styles.counterDiv} />
            <div className={styles.counter}>
              <span className={styles.counterVal}>{stats.completedBookings}</span>
              <span className={styles.counterLbl}>Сдал</span>
            </div>
            <div className={styles.counterDiv} />
            <div className={styles.counter}>
              <span className={styles.counterVal}>{stats.rentedCount}</span>
              <span className={styles.counterLbl}>Арендовал</span>
            </div>
            <div className={styles.counterDiv} />
            <div className={styles.counter}>
              <span className={`${styles.counterVal} ${styles.counterValAccent}`}>{user.rating.toFixed(1)}</span>
              <span className={styles.counterLbl}>Рейтинг</span>
            </div>
          </div>
        </motion.div>

        {/* ═══ Verification bar ═══ */}
        <motion.div
          className={styles.verifyBar}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
        >
          <VerifyItem icon={<CheckCircle2 size={15} />} label="Телефон" done />
          <VerifyItem icon={<Mail size={15} />} label="Email" done />
          <VerifyItem icon={<Shield size={15} />} label="Паспорт" done={false} />
          <VerifyItem icon={<BadgeCheck size={15} />} label="Фото" done />
        </motion.div>

        {/* ═══ Tabs ═══ */}
        <motion.nav
          className={styles.tabs}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
        >
          <TabBtn active={tab === 'overview'} icon={<User size={16} />} label="Обзор" onClick={() => setTab('overview')} />
          <TabBtn active={tab === 'listings'} icon={<LayoutGrid size={16} />} label="Объявления" badge={stats.totalListings} onClick={() => setTab('listings')} />
          <TabBtn active={tab === 'renting-out'} icon={<Upload size={16} />} label="Сдаю" badge={MOCK_BOOKINGS.filter((b) => b.side === 'owner').length} onClick={() => setTab('renting-out')} />
          <TabBtn active={tab === 'renting-in'} icon={<ShoppingBag size={16} />} label="Арендую" badge={MOCK_BOOKINGS.filter((b) => b.side === 'renter').length} onClick={() => setTab('renting-in')} />
        </motion.nav>

        {/* ═══ Tab Content ═══ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {tab === 'overview' && <OverviewPanel />}
            {tab === 'listings' && <ListingsPanel filter={listingFilter} onFilterChange={setListingFilter} />}
            {tab === 'renting-out' && (
              <BookingsPanel side="owner" title="Сдаю в аренду" subtitle="Вещи, которые вы сдаёте другим" filter={outFilter} onFilterChange={setOutFilter} />
            )}
            {tab === 'renting-in' && (
              <BookingsPanel side="renter" title="Арендую" subtitle="Вещи, которые вы берёте у других" filter={inFilter} onFilterChange={setInFilter} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══ Verification item ═══ */
function VerifyItem({ icon, label, done }: { icon: React.ReactNode; label: string; done: boolean }) {
  return (
    <div className={`${styles.verifyItem} ${done ? styles.verifyDone : styles.verifyPending}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

/* ═══ Stat Card ═══ */
function StatCard({ icon, iconCls, value, label }: { icon: React.ReactNode; iconCls: string; value: string; label: string }) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIcon} ${iconCls}`}>{icon}</div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

/* ═══ Tab Button ═══ */
function TabBtn({ active, icon, label, badge, onClick }: { active: boolean; icon: React.ReactNode; label: string; badge?: number; onClick: () => void }) {
  return (
    <button type="button" className={`${styles.tab} ${active ? styles.tabActive : ''}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
      {badge !== undefined && <span className={`${styles.tabBadge} ${!active ? styles.tabBadgeInactive : ''}`}>{badge}</span>}
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
        <StatCard icon={<Package size={20} />} iconCls={styles.statIconGreen} value={`${stats.activeListings} / ${stats.totalListings}`} label="Объявлений (акт. / всего)" />
        <StatCard icon={<Upload size={20} />} iconCls={styles.statIconBlue} value={`${ownerDeals.length}`} label="Сдал в аренду" />
        <StatCard icon={<ShoppingBag size={20} />} iconCls={styles.statIconPurple} value={`${renterDeals.length}`} label="Арендовал у других" />
        <Link href="/dev-ui/reviews" style={{ textDecoration: 'none', color: 'inherit' }}>
          <StatCard icon={<Star size={20} />} iconCls={styles.statIconAmber} value={user.rating.toFixed(1)} label={`${user.reviewCount} отзывов`} />
        </Link>
      </div>

      {/* Trust Indicators */}
      <div className={styles.trustGrid}>
        <div className={styles.trustCard}>
          <div className={styles.trustHeader}><Zap size={16} /><span>Скорость ответа</span></div>
          <div className={styles.trustBarWrap}><div className={styles.trustBar} style={{ width: `${stats.responseRate}%` }} /></div>
          <span className={styles.trustValue}>{stats.responseRate}%</span>
        </div>
        <div className={styles.trustCard}>
          <div className={styles.trustHeader}><TrendingUp size={16} /><span>Заработано</span></div>
          <span className={styles.trustBigValue}>{stats.totalEarnings} ₽</span>
        </div>
        <div className={styles.trustCard}>
          <div className={styles.trustHeader}><Handshake size={16} /><span>Потрачено на аренду</span></div>
          <span className={styles.trustBigValue}>{stats.totalSpent} ₽</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className={styles.quickActions}>
        <Link href="/dev-ui/create-listing" className={styles.quickAction}>
          <Package size={18} />
          <span>Сдать вещь</span>
        </Link>
        <Link href="/dev-ui" className={styles.quickAction}>
          <ShoppingBag size={18} />
          <span>Найти вещь</span>
        </Link>
        <Link href="/dev-ui/chat" className={styles.quickAction}>
          <MessageCircle size={18} />
          <span>Сообщения</span>
        </Link>
      </div>
    </div>
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
            <button key={f.value} type="button" className={`${styles.filterPill} ${filter === f.value ? styles.filterPillActive : ''}`} onClick={() => onFilterChange(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Package />} title="Нет объявлений" text="В этой категории пока ничего нет" />
      ) : (
        <div className={styles.listingsGrid}>
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}
            >
              <ListingCard item={item} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ListingCard({ item }: { item: ProfileListing }) {
  const st = ITEM_STATUS_MAP[item.status];
  return (
    <div className={styles.listingCard}>
      <div className={styles.listingCardImage}>
        {item.image ? (
          <img src={item.image} alt={item.title} />
        ) : (
          <div className={styles.listingCardPlaceholder}><ImageIcon size={28} /></div>
        )}
        <span className={`${styles.statusBadge} ${st.cls} ${styles.listingCardStatus}`}>{st.label}</span>
      </div>
      <div className={styles.listingCardBody}>
        <h3>{item.title}</h3>
        <span className={styles.listingCardCategory}>{item.category}</span>
        <div className={styles.listingCardFooter}>
          {item.price_per_day && (
            <span className={styles.listingCardPrice}>{item.price_per_day} ₽<small>/сут</small></span>
          )}
          <div className={styles.listingCardStats}>
            <span><Eye size={12} /> {item.views_count}</span>
            <span><CalendarCheck size={12} /> {item.bookingsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Bookings Panel ═══ */
function BookingsPanel({ side, title, subtitle, filter, onFilterChange }: { side: BookingSide; title: string; subtitle: string; filter: BookingFilter; onFilterChange: (f: BookingFilter) => void }) {
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
          <p className={styles.panelSubtitle}>{subtitle} · {filtered.length} {pluralize(filtered.length, 'сделка', 'сделки', 'сделок')}</p>
        </div>
        <div className={styles.filterPills}>
          {BOOKING_FILTERS.map((f) => (
            <button key={f.value} type="button" className={`${styles.filterPill} ${filter === f.value ? styles.filterPillActive : ''}`} onClick={() => onFilterChange(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={side === 'owner' ? <Upload /> : <ShoppingBag />} title={side === 'owner' ? 'Нет сделок по аренде' : 'Вы ещё ничего не арендовали'} text="В этой категории пока ничего нет" />
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
    <div className={styles.bookingRow}>
      <div className={`${styles.bookingStripe} ${st.cls}`} />
      {booking.itemImage ? (
        <img src={booking.itemImage} alt={booking.itemTitle} className={styles.bookingImg} />
      ) : (
        <div className={styles.bookingImgFallback}><Camera size={20} /></div>
      )}
      <div className={styles.bookingInfo}>
        <span className={styles.bookingTitle}>{booking.itemTitle}</span>
        <div className={styles.bookingMeta}>
          <span><User size={12} /> {counterLabel}: {booking.counterpartyName}</span>
          <span><Calendar size={12} /> {formatShortDate(booking.start_date)} — {formatShortDate(booking.end_date)}</span>
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
