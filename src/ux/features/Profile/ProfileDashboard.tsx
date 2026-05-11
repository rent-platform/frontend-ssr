'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Eye,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Plus,
  Share2,
  Shield,
  ShoppingBag,
  Star,
  TrendingUp,
  Upload,
  Wallet,
  Zap,
} from 'lucide-react';
import { CatalogHeader, CatalogFooter } from '../Catalog';
import clsx from 'clsx';
import { pluralize, formatDate, getInitials, ROUTES, EASE } from '@/ux/utils';
import type { ProfileTab, BookingSide } from './types';
import { MOCK_USER, MOCK_STATS, MOCK_BOOKINGS } from './mockProfileData';
import { getProfileCompletion } from './profileHelpers';
import type { ListingFilter, BookingFilter } from './profileHelpers';
import { ListingsPanel } from './components/ListingsPanel';
import { DealsPanel } from './components/DealsPanel';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { VerifyChip } from './components/VerifyChip';
import { TabBtn } from './components/TabBtn';
import { ShareModal } from '@/ux/components/ShareModal';
import styles from './ProfileDashboard.module.scss';

/* ═══════════════════════════════════════════════════════════════════════════════
   ProfileDashboard
   ═══════════════════════════════════════════════════════════════════════════════ */
export type ProfileDashboardProps = {
  /** User data from useProfile(). Falls back to mock. */
  user?: typeof MOCK_USER;
  /** Stats from API. Falls back to mock. */
  stats?: typeof MOCK_STATS;
  /** True while loading from API. */
  isLoading?: boolean;
};

export function ProfileDashboard({
  user: externalUser,
  stats: externalStats,
  isLoading: externalLoading,
}: ProfileDashboardProps = {}) {
  const [mockLoading, setMockLoading] = useState(!externalUser);
  const [tab, setTab] = useState<ProfileTab>('listings');
  const [listingFilter, setListingFilter] = useState<ListingFilter>('all');
  const [dealSide, setDealSide] = useState<BookingSide>('owner');
  const [dealFilter, setDealFilter] = useState<BookingFilter>('all');
  const [showShareModal, setShowShareModal] = useState(false);

  const user = externalUser ?? MOCK_USER;
  const stats = externalStats ?? MOCK_STATS;
  const isLoading = externalLoading ?? mockLoading;

  useEffect(() => {
    if (externalUser) return undefined;
    const t = setTimeout(() => setMockLoading(false), 800);
    return () => clearTimeout(t);
  }, [externalUser]);

  const initials = getInitials(user.fullName);
  const profileCompletion = getProfileCompletion(user);
  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/dev-ui/user/${user.id}`
    : `https://arendai.ru/user/${user.id}`;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className={styles.page}>
      <CatalogHeader cityLabel="Новосибирск" />

      {/* ── Hero Banner ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBreadcrumb}>
            <Link href={ROUTES.home} className={styles.backLink}>
              <ArrowLeft size={15} /> Каталог
            </Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>Мой профиль</span>
          </div>
        </div>
      </div>

      <main className={styles.container}>
        {/* ── Profile Card ── */}
        <motion.section
          className={styles.profileCard}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <div className={styles.cardTop}>
            <div className={styles.avatarArea}>
              <div className={styles.avatarRing}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className={styles.avatar} />
                ) : (
                  <div className={styles.avatarFallback}>{initials}</div>
                )}
              </div>
              <button type="button" className={styles.avatarEdit} aria-label="Изменить фото">
                <Camera size={12} />
              </button>
            </div>

            <div className={styles.identity}>
              <div className={styles.nameRow}>
                <h1>{user.fullName}</h1>
                <BadgeCheck size={20} className={styles.verifiedBadge} />
              </div>
              {user.nickname && <span className={styles.nickname}>@{user.nickname}</span>}
              {user.bio && <p className={styles.bio}>{user.bio}</p>}

              <div className={styles.metaRow}>
                <Link href={ROUTES.reviews} className={styles.ratingPill}>
                  <Star size={14} />
                  <strong>{user.rating.toFixed(1)}</strong>
                  <span>({user.reviewCount} {pluralize(user.reviewCount, 'отзыв', 'отзыва', 'отзывов')})</span>
                </Link>
                <span className={styles.metaChip}><Calendar size={13} /> С {formatDate(user.memberSince)}</span>
                {user.phone && <span className={styles.metaChip}><Phone size={13} /> {user.phone}</span>}
              </div>
            </div>

            <div className={styles.cardActions}>
              <Link href={ROUTES.settings} className={styles.btnEdit}>
                <Edit3 size={15} /> Редактировать
              </Link>
              <button
                type="button"
                className={styles.btnIcon}
                onClick={() => setShowShareModal(true)}
                title="Поделиться"
              >
                <Share2 size={16} />
              </button>
              <Link href={ROUTES.publicProfile(user.id)} className={styles.btnIcon} title="Публичный профиль">
                <Eye size={16} />
              </Link>
            </div>
          </div>

          {/* Verification */}
          <div className={styles.verifySection}>
            <div className={styles.verifyRow}>
              <VerifyChip icon={<CheckCircle2 size={14} />} label="Телефон" done tooltip="Номер телефона подтверждён" />
              <VerifyChip icon={<Mail size={14} />} label="Email" done tooltip="Электронная почта подтверждена" />
              <VerifyChip icon={<Shield size={14} />} label="Паспорт" done={false} tooltip="Пройдите верификацию документа" />
              <VerifyChip icon={<BadgeCheck size={14} />} label="Фото" done tooltip="Фото профиля подтверждено" />
            </div>
          </div>

          {/* Completion */}
          {profileCompletion < 100 && (
            <div className={styles.completionStrip}>
              <div className={styles.completionInfo}>
                <Zap size={15} className={styles.completionIcon} />
                <span>Профиль заполнен на <strong>{profileCompletion}%</strong></span>
              </div>
              <div className={styles.completionTrack}>
                <motion.div
                  className={styles.completionFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletion}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
                />
              </div>
              <Link href={ROUTES.settings} className={styles.completionLink}>
                Заполнить <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </motion.section>

        {/* ── Stats ── */}
        <motion.div
          className={styles.statsRow}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
        >
          <div className={clsx(styles.statCard, styles.statGreen)}>
            <div className={styles.statIcon}><Package size={20} /></div>
            <div className={styles.statData}>
              <span className={styles.statNum}>{stats.activeListings}</span>
              <span className={styles.statLabel}>Объявлений</span>
            </div>
          </div>
          <div className={clsx(styles.statCard, styles.statBlue)}>
            <div className={styles.statIcon}><Upload size={20} /></div>
            <div className={styles.statData}>
              <span className={styles.statNum}>{stats.completedBookings}</span>
              <span className={styles.statLabel}>Сдано</span>
            </div>
          </div>
          <div className={clsx(styles.statCard, styles.statViolet)}>
            <div className={styles.statIcon}><ShoppingBag size={20} /></div>
            <div className={styles.statData}>
              <span className={styles.statNum}>{stats.rentedCount}</span>
              <span className={styles.statLabel}>Арендовано</span>
            </div>
          </div>
          <div className={clsx(styles.statCard, styles.statAmber)}>
            <div className={styles.statIcon}><Star size={20} /></div>
            <div className={styles.statData}>
              <span className={clsx(styles.statNum, styles.statNumHighlight)}>{user.rating.toFixed(1)}</span>
              <span className={styles.statLabel}>Рейтинг</span>
            </div>
          </div>
        </motion.div>

        {/* ── Earnings ── */}
        <motion.div
          className={styles.earningsRow}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
        >
          <div className={clsx(styles.earningsCard, styles.earningsCardGreen)}>
            <div className={styles.earningsIcon}><TrendingUp size={18} /></div>
            <div className={styles.earningsData}>
              <span className={styles.earningsVal}>{stats.totalEarnings} ₽</span>
              <span className={styles.earningsLabel}>Заработано</span>
            </div>
          </div>
          <div className={clsx(styles.earningsCard, styles.earningsCardBlue)}>
            <div className={styles.earningsIcon}><Wallet size={18} /></div>
            <div className={styles.earningsData}>
              <span className={styles.earningsVal}>{stats.totalSpent} ₽</span>
              <span className={styles.earningsLabel}>Потрачено</span>
            </div>
          </div>
          <div className={clsx(styles.earningsCard, styles.earningsCardAmber)}>
            <div className={styles.earningsIcon}><BarChart3 size={18} /></div>
            <div className={styles.earningsData}>
              <span className={styles.earningsVal}>{stats.responseRate}%</span>
              <span className={styles.earningsLabel}>Отвечаемость</span>
            </div>
          </div>
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div
          className={styles.quickActions}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
        >
          <Link href={ROUTES.createListing} className={styles.quickAction}>
            <div className={styles.quickActionIcon}><Plus size={18} /></div>
            <div className={styles.quickActionText}>
              <span className={styles.quickActionLabel}>Новое объявление</span>
              <span className={styles.quickActionHint}>Разместить вещь</span>
            </div>
            <ArrowUpRight size={16} className={styles.quickActionArrow} />
          </Link>
          <Link href={ROUTES.chat} className={styles.quickAction}>
            <div className={styles.quickActionIcon}><MessageCircle size={18} /></div>
            <div className={styles.quickActionText}>
              <span className={styles.quickActionLabel}>Сообщения</span>
              <span className={styles.quickActionHint}>Чат с арендаторами</span>
            </div>
            <ArrowUpRight size={16} className={styles.quickActionArrow} />
          </Link>
          <Link href={ROUTES.reviews} className={styles.quickAction}>
            <div className={styles.quickActionIcon}><Star size={18} /></div>
            <div className={styles.quickActionText}>
              <span className={styles.quickActionLabel}>Мои отзывы</span>
              <span className={styles.quickActionHint}>{user.reviewCount} {pluralize(user.reviewCount, 'отзыв', 'отзыва', 'отзывов')}</span>
            </div>
            <ArrowUpRight size={16} className={styles.quickActionArrow} />
          </Link>
        </motion.div>

        {/* ── Tabs ── */}
        <motion.nav
          className={styles.tabBar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25, ease: EASE }}
        >
          <TabBtn active={tab === 'listings'} label="Мои объявления" count={stats.totalListings} onClick={() => setTab('listings')} />
          <TabBtn active={tab === 'deals'} label="Мои аренды" count={MOCK_BOOKINGS.length} onClick={() => setTab('deals')} />
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
