'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
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
  Upload,
  Zap,
} from 'lucide-react';
import { CatalogHeader } from '@/ux/layouts/SiteHeader';
import { CatalogFooter } from '@/ux/layouts/SiteFooter';
import clsx from 'clsx';
import { pluralize, formatDate, ROUTES, EASE } from '@/ux/utils';
import { MOCK_USER, MOCK_STATS } from './mockProfileData';
import { ListingsPanel } from './components/ListingsPanel';
import { DealsPanel } from './components/DealsPanel';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { VerifyChip } from './components/VerifyChip';
import { TabBtn } from './components/TabBtn';
import { ShareModal } from '@/ux/components/ShareModal';
import { useProfileDashboard } from './hooks/useProfileDashboard';
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
  const {
    user,
    stats,
    isLoading,
    tab,
    setTab,
    listingFilter,
    setListingFilter,
    dealSide,
    setDealSide,
    dealFilter,
    setDealFilter,
    showShareModal,
    openShareModal,
    closeShareModal,
    initials,
    profileCompletion,
    profileUrl,
    handleOpenItem,
    bookings,
  } = useProfileDashboard({
    user: externalUser,
    stats: externalStats,
    isLoading: externalLoading,
  });

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
              <div className={styles.subRow}>
                {user.nickname && <span className={styles.nickname}>@{user.nickname}</span>}
                {user.phone && (
                  <>
                    <span className={styles.subRowDot} />
                    <span className={styles.phoneInline}><Phone size={13} /> {user.phone}</span>
                  </>
                )}
              </div>
              {user.bio && <p className={styles.bio}>{user.bio}</p>}

              <div className={styles.metaRow}>
                <Link href={ROUTES.reviews} className={styles.ratingPill}>
                  <Star size={14} />
                  <strong>{user.rating.toFixed(1)}</strong>
                  <span>({user.reviewCount} {pluralize(user.reviewCount, 'отзыв', 'отзыва', 'отзывов')})</span>
                </Link>
                <span className={styles.metaChip}><Calendar size={13} /> С {formatDate(user.memberSince)}</span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <Link href={ROUTES.settings} className={styles.btnEdit}>
                <Edit3 size={15} /> Редактировать
              </Link>
              <button
                type="button"
                className={styles.btnIcon}
                onClick={openShareModal}
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

        {/* ── Tabs ── */}
        <motion.nav
          className={styles.tabBar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.25, ease: EASE }}
        >
          <TabBtn active={tab === 'listings'} label="Мои объявления" count={stats.totalListings} onClick={() => setTab('listings')} />
          <TabBtn active={tab === 'deals'} label="Мои аренды" count={bookings.length} onClick={() => setTab('deals')} />
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
            {tab === 'listings' && <ListingsPanel filter={listingFilter} onFilterChange={setListingFilter} onOpen={handleOpenItem} />}
            {tab === 'deals' && <DealsPanel side={dealSide} onSideChange={setDealSide} filter={dealFilter} onFilterChange={setDealFilter} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <CatalogFooter />

      <AnimatePresence>
        {showShareModal && <ShareModal url={profileUrl} onClose={closeShareModal} />}
      </AnimatePresence>
    </div>
  );
}
