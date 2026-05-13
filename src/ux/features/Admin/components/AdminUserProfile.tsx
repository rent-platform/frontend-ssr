'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  AtSign,
  Award,
  BadgeCheck,
  Ban,
  Calendar,
  Check,
  ChevronLeft,
  Crown,
  ExternalLink,
  Mail,
  MapPin,
  Package,
  Phone,
  Shield,
  ShieldCheck,
  Star,
  ThumbsUp,
  Trash2,
  UserCog,
} from 'lucide-react';
import clsx from 'clsx';
import { pluralize, formatDate, getInitials } from '@/ux/utils';
import { CatalogCard } from '../../Catalog';
import { MOCK_PUBLIC_LISTINGS, MOCK_PUBLIC_REVIEWS } from '../../PublicProfile/mockPublicProfileData';
import { RATING_DISTRIBUTION } from '../../PublicProfile/publicProfileHelpers';
import type { CatalogUiItem } from '../../Catalog';
import type { PublicListing } from '../../PublicProfile/types';
import type { AdminUser } from '../types';
import type { PublicUser, PublicReview } from '../../PublicProfile/types';
import type { UserRole } from '@/business/auth';
import styles from './AdminUserProfile.module.scss';

const MOCK_CREATED_DATES = [
  '2025-03-05', '2025-02-20', '2025-01-15', '2025-03-01',
  '2024-12-10', '2025-02-08', '2024-11-22', '2025-01-30',
  '2024-10-14', '2025-03-12',
];

function adminListingToCatalogItem(listing: PublicListing, user: PublicUser, index: number): CatalogUiItem {
  return {
    id: listing.id,
    title: listing.title,
    coverImageUrl: listing.image ?? '',
    images: listing.image ? [listing.image] : [],
    category: listing.category,
    pricePerDay: listing.pricePerDay,
    pricePerHour: null,
    depositAmount: '',
    pickupLocation: user.city,
    status: 'ACTIVE' as const,
    isAvailable: listing.isAvailable,
    viewsCount: 0,
    createdAt: MOCK_CREATED_DATES[index % MOCK_CREATED_DATES.length],
    nearestAvailableDate: null,
    ownerName: user.fullName,
    ownerAvatar: user.avatarUrl,
    ownerRating: listing.rating,
    quickFilters: [],
  } as CatalogUiItem;
}

const EASE = [0.23, 1, 0.32, 1] as const;
const VISIBLE_LISTINGS = 6;
const VISIBLE_REVIEWS = 4;

const ROLE_LABELS: Record<UserRole, string> = {
  user: 'Пользователь',
  moderator: 'Модератор',
  admin: 'Админ',
};

const ROLE_BADGE: Record<UserRole, string> = {
  user: styles.badgeGray,
  moderator: styles.badgeBlue,
  admin: styles.badgePurple,
};

type Tab = 'listings' | 'reviews';

export type AdminUserProfileProps = {
  user: AdminUser;
  onBack: () => void;
  onBan: (id: string) => void;
  onChangeRole: (user: AdminUser) => void;
};

/* ── Map AdminUser → PublicUser (for display purposes) ── */
function toPublicUser(admin: AdminUser): PublicUser {
  return {
    id: admin.id,
    fullName: admin.fullName ?? 'Без имени',
    nickname: admin.nickname,
    avatarUrl: admin.avatarUrl,
    bio: null,
    rating: 0,
    reviewCount: 0,
    memberSince: admin.createdAt,
    city: 'Новосибирск',
    isVerified: admin.role !== 'user',
    responseTime: '—',
    responseRate: 0,
    completedDeals: admin.dealsCount,
    activeListings: admin.listingsCount,
    lastOnline: admin.isActive ? 'Онлайн' : 'Заблокирован',
    languages: [],
    trustLevel: admin.dealsCount >= 50 ? 'super' : admin.dealsCount >= 10 ? 'experienced' : 'new',
  };
}

/* ── Inline review card (admin version with delete button) ── */
function AdminReviewCard({
  review,
  index,
}: {
  review: PublicReview;
  index: number;
}) {
  const authorInitials = getInitials(review.authorName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: EASE }}
    >
      <div className={styles.reviewCard}>
        <div className={styles.reviewHeader}>
          <div className={styles.reviewAvatar}>{authorInitials}</div>
          <div className={styles.reviewMeta}>
            <strong>{review.authorName}</strong>
            <span className={styles.reviewItemTag}>
              <ExternalLink size={11} />
              {review.itemTitle}
            </span>
          </div>
          <div className={styles.reviewRight}>
            <div className={styles.reviewStars}>
              {Array.from({ length: 5 }).map((_, si) => (
                <Star key={si} size={12} className={si < review.rating ? styles.starFilled : styles.starEmpty} />
              ))}
            </div>
            <span className={styles.reviewDate}>{formatDate(review.date)}</span>
          </div>
        </div>
        <p className={styles.reviewText}>{review.text}</p>
        <div className={styles.reviewActions}>
          <button type="button" className={styles.deleteReviewBtn}>
            <Trash2 size={13} />
            Удалить отзыв
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ Main component ═══ */
export function AdminUserProfile({ user, onBack, onBan, onChangeRole }: AdminUserProfileProps) {
  const publicUser = useMemo(() => toPublicUser(user), [user]);
  const listings = MOCK_PUBLIC_LISTINGS;
  const reviews = MOCK_PUBLIC_REVIEWS;

  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [showAllListings, setShowAllListings] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const visibleListings = useMemo(
    () => (showAllListings ? listings : listings.slice(0, VISIBLE_LISTINGS)),
    [listings, showAllListings],
  );
  const visibleReviews = useMemo(
    () => (showAllReviews ? reviews : reviews.slice(0, VISIBLE_REVIEWS)),
    [reviews, showAllReviews],
  );

  const initials = getInitials(publicUser.fullName);

  const memberMonths = useMemo(() => {
    const diff = Date.now() - new Date(publicUser.memberSince).getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 30)));
  }, [publicUser.memberSince]);

  const maxDistCount = Math.max(...RATING_DISTRIBUTION.map((r) => r.count));

  return (
    <motion.div
      className={styles.profileWrapper}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginBottom: 20 }}
    >
      {/* ═══ Admin toolbar ═══ */}
      <div className={styles.adminToolbar}>
        <button className={styles.adminToolbarBack} onClick={onBack}>
          <ChevronLeft size={16} /> Назад к списку
        </button>

        <div className={styles.adminToolbarBadges}>
          <span className={clsx(styles.badge, ROLE_BADGE[user.role as UserRole])}>
            {ROLE_LABELS[user.role as UserRole]}
          </span>
          <span className={clsx(styles.badge, user.isActive ? styles.badgeGreen : styles.badgeRed)}>
            {user.isActive ? 'Активен' : 'Заблокирован'}
          </span>
        </div>
      </div>

      {/* ═══ Profile content ═══ */}
      <div className={styles.profileContent}>
        <div className={styles.profileLayout}>
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
                    <img src={user.avatarUrl} alt={publicUser.fullName} className={styles.avatarImg} />
                  ) : (
                    <div className={styles.avatarFallback}>{initials}</div>
                  )}
                </div>
                {user.isActive ? (
                  <div className={styles.onlineDot} />
                ) : (
                  <div className={styles.blockedDot} />
                )}
              </div>

              <div className={styles.userName}>
                <h2>{publicUser.fullName}</h2>
                {publicUser.isVerified && <BadgeCheck size={18} className={styles.verifiedIcon} />}
              </div>
              {user.nickname && <span className={styles.userNickname}>@{user.nickname}</span>}

              <span className={clsx(styles.userRoleBadge, ROLE_BADGE[user.role as UserRole])}>
                {ROLE_LABELS[user.role as UserRole]}
              </span>

              {/* Admin actions in sidebar */}
              <div className={styles.userCardDivider} />
              <div className={styles.adminActions}>
                <button
                  className={clsx(
                    styles.adminActionBtn,
                    user.isActive ? styles.adminActionBan : styles.adminActionUnban,
                  )}
                  onClick={() => onBan(user.id)}
                >
                  {user.isActive ? <><Ban size={16} /> Заблокировать</> : <><Check size={16} /> Разблокировать</>}
                </button>
                <button
                  className={clsx(styles.adminActionBtn, styles.adminActionRole)}
                  onClick={() => onChangeRole(user)}
                >
                  <UserCog size={16} /> Сменить роль
                </button>
              </div>
            </motion.div>

            {/* Admin info card */}
            <motion.div
              className={styles.adminInfoCard}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.06, ease: EASE }}
            >
              <div className={styles.adminInfoHeader}>
                <div className={styles.adminInfoIconWrap}>
                  <Shield size={14} />
                </div>
                <h3 className={styles.adminInfoTitle}>Служебная информация</h3>
              </div>
              <div className={styles.adminInfoGrid}>
                <div className={styles.adminInfoRow}>
                  <span className={styles.adminInfoLabel}>
                    <Mail size={14} />
                    Email
                  </span>
                  <span className={styles.adminInfoValue}>{user.email ?? '—'}</span>
                </div>
                <div className={styles.adminInfoRow}>
                  <span className={styles.adminInfoLabel}>
                    <Phone size={14} />
                    Телефон
                  </span>
                  <span className={styles.adminInfoValue}>{user.phone}</span>
                </div>
                <div className={styles.adminInfoRow}>
                  <span className={styles.adminInfoLabel}>
                    <AtSign size={14} />
                    Никнейм
                  </span>
                  <span className={styles.adminInfoValue}>{user.nickname ?? '—'}</span>
                </div>
                <div className={styles.adminInfoRow}>
                  <span className={styles.adminInfoLabel}>
                    <Crown size={14} />
                    Роль
                  </span>
                  <span className={styles.adminInfoValue}>{ROLE_LABELS[user.role as UserRole]}</span>
                </div>
                <div className={styles.adminInfoRow}>
                  <span className={styles.adminInfoLabel}>
                    <Calendar size={14} />
                    Регистрация
                  </span>
                  <span className={styles.adminInfoValue}>{formatDate(user.createdAt)}</span>
                </div>
                <div className={styles.adminInfoRow}>
                  <span className={styles.adminInfoLabel}>ID</span>
                  <span className={styles.adminInfoValue} style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11 }}>
                    {user.id}
                  </span>
                </div>
              </div>
            </motion.div>

          </aside>

          {/* ── Main content ── */}
          <main className={styles.main}>
            {/* Stats strip */}
            <motion.div
              className={styles.statsStrip}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
            >
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Package size={20} /></div>
                <div className={styles.statContent}>
                  <span className={styles.statVal}>{user.listingsCount}</span>
                  <span className={styles.statLabel}>{pluralize(user.listingsCount, 'Объявление', 'Объявления', 'Объявлений')}</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><ShieldCheck size={20} /></div>
                <div className={styles.statContent}>
                  <span className={styles.statVal}>{user.dealsCount}</span>
                  <span className={styles.statLabel}>{pluralize(user.dealsCount, 'Сделка', 'Сделки', 'Сделок')}</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}><Calendar size={20} /></div>
                <div className={styles.statContent}>
                  <span className={styles.statVal}>{memberMonths}</span>
                  <span className={styles.statLabel}>{pluralize(memberMonths, 'Месяц', 'Месяца', 'Месяцев')} на платформе</span>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className={styles.tabBar}>
              <button
                type="button"
                className={clsx(styles.tab, activeTab === 'listings' && styles.tabActive)}
                onClick={() => setActiveTab('listings')}
              >
                <Package size={16} />
                Объявления
                <span className={styles.tabCount}>{listings.length}</span>
              </button>
              <button
                type="button"
                className={clsx(styles.tab, activeTab === 'reviews' && styles.tabActive)}
                onClick={() => setActiveTab('reviews')}
              >
                <Star size={16} />
                Отзывы
                <span className={styles.tabCount}>{reviews.length}</span>
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
                            item={adminListingToCatalogItem(item, publicUser, i)}
                            index={i}
                          />
                        ))}
                      </div>

                      {!showAllListings && listings.length > VISIBLE_LISTINGS && (
                        <div className={styles.showMoreWrap}>
                          <button
                            type="button"
                            className={styles.showMoreBtn}
                            onClick={() => setShowAllListings(true)}
                          >
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
                      <p>У пользователя нет объявлений</p>
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
                  {/* Rating breakdown */}
                  <div className={styles.ratingBreakdown}>
                    <div className={styles.ratingBig}>
                      <span className={styles.ratingBigValue}>4.9</span>
                      <div className={styles.ratingBigStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={16} className={i < 5 ? styles.starFilled : styles.starEmpty} />
                        ))}
                      </div>
                      <span className={styles.ratingBigCount}>
                        {reviews.length} {pluralize(reviews.length, 'отзыв', 'отзыва', 'отзывов')}
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
                          <AdminReviewCard key={review.id} review={review} index={i} />
                        ))}
                      </div>

                      {!showAllReviews && reviews.length > VISIBLE_REVIEWS && (
                        <div className={styles.showMoreWrap}>
                          <button
                            type="button"
                            className={styles.showMoreBtn}
                            onClick={() => setShowAllReviews(true)}
                          >
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
      </div>
    </motion.div>
  );
}
