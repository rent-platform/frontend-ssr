'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Camera,
  CheckCircle2,
  Edit3,
  Eye,
  Mail,
  Phone,
  Share2,
  Shield,
  Star,
  Zap,
} from 'lucide-react';
import { CatalogHeader, CatalogFooter } from '../Catalog';
import { pluralize, formatDate, ROUTES } from '@/ux/utils';
import type { ProfileTab, BookingSide } from './types';
import { MOCK_USER, MOCK_STATS, MOCK_BOOKINGS } from './mockProfileData';
import { EASE, getProfileCompletion } from './profileHelpers';
import type { ListingFilter, BookingFilter } from './profileHelpers';
import { ListingsPanel } from './components/ListingsPanel';
import { DealsPanel } from './components/DealsPanel';
import { ShareModal } from './components/ShareModal';
import styles from './ProfileDashboard.module.scss';

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
          <Link href={ROUTES.home} className={styles.backLink}><ArrowLeft size={15} /> Каталог</Link>
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
              <Link href={ROUTES.settings} className={styles.btnPrimary}>
                <Edit3 size={15} /> Редактировать
              </Link>
              <button type="button" className={styles.btnIcon} onClick={() => setShowShareModal(true)} title="Поделиться">
                <Share2 size={17} />
              </button>
              <Link href={ROUTES.publicProfile(user.id)} className={styles.btnIcon} title="Публичный профиль">
                <Eye size={17} />
              </Link>
            </div>
          </div>

          <div className={styles.profileBody}>
            {user.bio && <p className={styles.bio}>{user.bio}</p>}

            <div className={styles.metaRow}>
              <Link href={ROUTES.reviews} className={styles.ratingChip}>
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
              <Link href={ROUTES.settings} className={styles.completionLink}>Заполнить →</Link>
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

