'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Calendar,
  Check,
  CheckCircle2,
  Flag,
  MapPin,
  MessageCircle,
  Package,
  Share2,
  Shield,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { CatalogHeader, CatalogFooter, CatalogCard } from '../Catalog';
import clsx from 'clsx';
import { pluralize, formatDate, ROUTES, EASE } from '@/ux/utils';
import { ShareModal } from '@/ux/components/ShareModal';
import {
  VISIBLE_LISTINGS,
  VISIBLE_REVIEWS,
  TRUST_LABELS,
  RATING_DISTRIBUTION,
  publicListingToCatalogItem,
} from './publicProfileHelpers';
import { ProfileSkeleton } from './components/ProfileSkeleton';
import { PublicReviewCard } from './components/PublicReviewCard';
import { ReportModal } from './components/ReportModal';
import { usePublicProfile } from './hooks/usePublicProfile';
import styles from './PublicProfile.module.scss';

/* ═══ Main component ═══ */
export function PublicProfile() {
  const {
    user,
    listings,
    reviews,
    isLoading,
    activeTab,
    setActiveTab,
    showAllListings,
    showAllReviews,
    helpfulReviews,
    showShareModal,
    showReportModal,
    reported,
    fromItemId,
    visibleListings,
    visibleReviews,
    initials,
    memberMonths,
    maxDistCount,
    profileUrl,
    toggleHelpful,
    openShareModal,
    closeShareModal,
    openReportModal,
    closeReportModal,
    markReported,
    showMoreListings,
    showMoreReviews,
    navigateToListing,
  } = usePublicProfile();

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className={styles.page}>
      {/* ═══ Site header ═══ */}
      <CatalogHeader cityLabel={user.city} />

      {/* ── Breadcrumb bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          {fromItemId ? (
            <Link href={`${ROUTES.catalog}?item=${fromItemId}`} className={styles.backLink}>
              <ArrowLeft size={16} />
              Назад к объявлению
            </Link>
          ) : (
            <Link href={ROUTES.home} className={styles.backLink}>
              <ArrowLeft size={16} />
              Каталог
            </Link>
          )}
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Профиль</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{user.fullName}</span>
        </div>
      </div>

      {/* ═══ Two-column layout ═══ */}
      <div className={styles.layout}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <motion.div
            className={styles.userCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className={styles.avatarWrap}>
              <div className={styles.avatarRing}>
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarFallback}>{initials}</div>
                )}
              </div>
              {user.lastOnline === 'Онлайн' && <div className={styles.onlineDot} />}
            </div>

            <div className={styles.userName}>
              <h1>{user.fullName}</h1>
              {user.isVerified && <BadgeCheck size={18} className={styles.verifiedIcon} />}
            </div>
            {user.nickname && <span className={styles.userNickname}>@{user.nickname}</span>}

            {user.trustLevel === 'super' && (
              <div className={clsx(styles.trustBadge, styles.tooltipWrap)}>
                <Award size={14} />
                {TRUST_LABELS[user.trustLevel]}
                <span className={styles.tooltipBubble}>Надёжный арендодатель с высоким рейтингом</span>
              </div>
            )}

            <div className={styles.quickStats}>
              <div className={clsx(styles.quickStat, styles.tooltipWrap)}>
                <Star size={14} className={styles.starFilled} />
                <strong>{user.rating.toFixed(1)}</strong>
                <span className={styles.tooltipBubble}>Средняя оценка от арендаторов</span>
              </div>
              <span className={styles.quickStatSep} />
              <div className={clsx(styles.quickStat, styles.tooltipWrap)}>
                <strong>{user.reviewCount}</strong>
                <span>{pluralize(user.reviewCount, 'отзыв', 'отзыва', 'отзывов')}</span>
                <span className={styles.tooltipBubble}>Количество отзывов от пользователей</span>
              </div>
            </div>

            <Link href={ROUTES.chat} className={styles.ctaBtn}>
              <MessageCircle size={16} />
              Написать сообщение
            </Link>

            <div className={styles.secondaryActions}>
              <button type="button" className={styles.iconBtn} title="Поделиться" onClick={openShareModal}>
                <Share2 size={15} />
              </button>
              <button
                type="button"
                className={clsx(styles.reportBtn, reported && styles.reportBtnDone)}
                onClick={openReportModal}
                disabled={reported}
              >
                {reported ? <><Check size={14} /> Жалоба отправлена</> : <><Flag size={14} /> Пожаловаться</>}
              </button>
            </div>
          </motion.div>

          <motion.div
            className={styles.infoCard}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: EASE }}
          >
            <h3 className={styles.infoCardTitle}>
              <ShieldCheck size={16} />
              Подтверждения
            </h3>
            <ul className={styles.verifyList}>
              {user.isVerified && (
                <li className={clsx(styles.verifyItem, styles.tooltipWrap)}>
                  <CheckCircle2 size={15} />
                  Личность подтверждена
                  <span className={styles.tooltipBubble}>Паспорт проверен модератором</span>
                </li>
              )}
              <li className={clsx(styles.verifyItem, styles.tooltipWrap)}>
                <CheckCircle2 size={15} />
                Номер телефона
                <span className={styles.tooltipBubble}>Телефон подтверждён по SMS</span>
              </li>
              <li className={clsx(styles.verifyItem, styles.tooltipWrap)}>
                <CheckCircle2 size={15} />
                Электронная почта
                <span className={styles.tooltipBubble}>Email подтверждён</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            className={styles.infoCard}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease: EASE }}
          >
            <h3 className={styles.infoCardTitle}>О пользователе</h3>
            <div className={styles.aboutList}>
              <div className={styles.aboutRow}>
                <MapPin size={15} />
                <span>{user.city}</span>
              </div>
              <div className={styles.aboutRow}>
                <Calendar size={15} />
                <span>На платформе с {formatDate(user.memberSince, 'long')}</span>
              </div>
            </div>
          </motion.div>

        </aside>

        {/* ── Main ── */}
        <main className={styles.main}>
          {user.bio && (
            <motion.div
              className={styles.bioCard}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
            >
              <h2 className={styles.bioTitle}>О себе</h2>
              <p className={styles.bioText}>{user.bio}</p>
            </motion.div>
          )}

          <motion.div
            className={styles.statsStrip}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
          >
            <div className={clsx(styles.statCard, styles.tooltipWrap)}>
              <span className={styles.statVal}>{user.activeListings}</span>
              <span className={styles.statLabel}>Активных объявлений</span>
              <span className={styles.tooltipBubble}>Вещи, доступные для аренды сейчас</span>
            </div>
            <div className={clsx(styles.statCard, styles.tooltipWrap)}>
              <span className={styles.statVal}>{user.completedDeals}</span>
              <span className={styles.statLabel}>Завершённых аренд</span>
              <span className={styles.tooltipBubble}>Успешно завершённых аренд</span>
            </div>
            <div className={clsx(styles.statCard, styles.tooltipWrap)}>
              <span className={clsx(styles.statVal, styles.statValAccent)}>{user.rating.toFixed(1)}</span>
              <span className={styles.statLabel}>Средний рейтинг</span>
              <span className={styles.tooltipBubble}>Средняя оценка от арендаторов</span>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className={styles.tabBar}>
            <button
              type="button"
              className={clsx(styles.tab, activeTab === 'listings' && styles.tabActive, styles.tooltipWrap)}
              onClick={() => setActiveTab('listings')}
            >
              <Package size={16} />
              Объявления
              <span className={styles.tabCount}>{listings.length}</span>
              <span className={styles.tooltipBubble}>Вещи, которые можно арендовать</span>
            </button>
            <button
              type="button"
              className={clsx(styles.tab, activeTab === 'reviews' && styles.tabActive, styles.tooltipWrap)}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={16} />
              Отзывы
              <span className={styles.tabCount}>{user.reviewCount}</span>
              <span className={styles.tooltipBubble}>Оценки и отзывы арендаторов</span>
            </button>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === 'listings' && (
              <motion.div
                key="listings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                {visibleListings.length > 0 ? (
                  <>
                    <div className={styles.listingsGrid}>
                      {visibleListings.map((item, i) => (
                        <CatalogCard
                          key={item.id}
                          item={publicListingToCatalogItem(item, user)}
                          index={i}
                          onOpen={(catalogItem) => navigateToListing(catalogItem.id)}
                        />
                      ))}
                    </div>

                    {!showAllListings && listings.length > VISIBLE_LISTINGS && (
                      <div className={styles.showMoreWrap}>
                        <button type="button" className={styles.showMoreBtn} onClick={showMoreListings}>
                          Показать все объявления ({listings.length})
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <Package size={32} />
                    <h3>Нет активных объявлений</h3>
                    <p>Пользователь пока не разместил объявлений</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                <div className={styles.ratingBreakdown}>
                  <div className={styles.ratingBig}>
                    <span className={styles.ratingBigValue}>{user.rating.toFixed(1)}</span>
                    <div className={styles.ratingBigStars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={16} className={i < Math.round(user.rating) ? styles.starFilled : styles.starEmpty} />
                      ))}
                    </div>
                    <span className={styles.ratingBigCount}>
                      {user.reviewCount} {pluralize(user.reviewCount, 'отзыв', 'отзыва', 'отзывов')}
                    </span>
                  </div>
                  <div className={styles.ratingBars}>
                    {RATING_DISTRIBUTION.map((row) => (
                      <div key={row.stars} className={styles.ratingBarRow}>
                        <span className={styles.ratingBarLabel}>{row.stars}</span>
                        <Star size={11} className={styles.starFilled} />
                        <div className={styles.ratingBarTrack}>
                          <div
                            className={styles.ratingBarFill}
                            style={{ width: maxDistCount > 0 ? `${(row.count / maxDistCount) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className={styles.ratingBarCount}>{row.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {visibleReviews.length > 0 ? (
                  <>
                    <div className={styles.reviewsList}>
                      {visibleReviews.map((review, i) => (
                        <PublicReviewCard
                          key={review.id}
                          review={review}
                          index={i}
                          isHelpful={helpfulReviews.has(review.id)}
                          onToggleHelpful={toggleHelpful}
                        />
                      ))}
                    </div>

                    {!showAllReviews && reviews.length > VISIBLE_REVIEWS && (
                      <div className={styles.showMoreWrap}>
                        <button type="button" className={styles.showMoreBtn} onClick={showMoreReviews}>
                          Показать все отзывы ({reviews.length})
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <Star size={32} />
                    <h3>Пока нет отзывов</h3>
                    <p>Отзывы появятся после завершённых аренд</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ═══ Safety banner ═══ */}
      <div className={styles.safetyBanner}>
        <div className={styles.safetyInner}>
          <Shield size={20} />
          <div>
            <strong>Безопасная аренда на платформе Арендай</strong>
            <p>Все арендодатели проходят верификацию. Вещи застрахованы, оплата через безопасную аренду.</p>
          </div>
        </div>
      </div>

      <CatalogFooter />

      {/* ═══ Share modal ═══ */}
      <AnimatePresence>
        {showShareModal && <ShareModal url={profileUrl} onClose={closeShareModal} />}
      </AnimatePresence>

      {/* ═══ Report modal ═══ */}
      <AnimatePresence>
        {showReportModal && (
          <ReportModal
            userName={user.fullName}
            onClose={closeReportModal}
            onSubmitted={markReported}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
