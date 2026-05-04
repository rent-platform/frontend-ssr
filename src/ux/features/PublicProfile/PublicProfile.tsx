'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Copy,
  ExternalLink,
  Flag,
  Info,
  MapPin,
  MessageCircle,
  Package,
  Share2,
  Shield,
  ShieldCheck,
  Star,
  ThumbsUp,
  X,
} from 'lucide-react';
import { CatalogHeader } from '../Catalog/components/CatalogHeader';
import { CatalogFooter } from '../Catalog/components/CatalogFooter';
import { CatalogCard } from '../Catalog/components/CatalogCard';
import type { CatalogUiItem } from '../Catalog/types';
import { MOCK_PUBLIC_USER, MOCK_PUBLIC_LISTINGS, MOCK_PUBLIC_REVIEWS } from './mockPublicProfileData';
import type { TrustLevel, PublicListing, PublicUser } from './types';
import { pluralize, formatDate, ROUTES } from '@/ux/utils';
import styles from './PublicProfile.module.scss';

const EASE = [0.23, 1, 0.32, 1] as const;
const VISIBLE_LISTINGS = 6;
const VISIBLE_REVIEWS = 4;

function publicListingToCatalogItem(listing: PublicListing, user: PublicUser): CatalogUiItem {
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
    status: 'active' as const,
    isAvailable: listing.isAvailable,
    viewsCount: 0,
    createdAt: user.memberSince,
    nearestAvailableDate: null,
    ownerName: user.full_name,
    ownerAvatar: user.avatar_url,
    ownerRating: listing.rating,
    quickFilters: [],
  } as CatalogUiItem;
}


function formatMemberSince(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

const TRUST_LABELS: Record<TrustLevel, string> = {
  new: 'Новый пользователь',
  verified: 'Проверенный',
  experienced: 'Опытный арендодатель',
  super: 'Суперарендодатель',
};

const RATING_DISTRIBUTION = [
  { stars: 5, count: 68 },
  { stars: 4, count: 12 },
  { stars: 3, count: 5 },
  { stars: 2, count: 1 },
  { stars: 1, count: 1 },
];

type Tab = 'listings' | 'reviews';

/* ── Skeleton placeholder ── */
function ProfileSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.skeletonHeader}>
        <div className={styles.shimmer} style={{ width: 140, height: 28, borderRadius: 8 }} />
        <div style={{ flex: 1 }} />
        <div className={styles.shimmer} style={{ width: 100, height: 28, borderRadius: 8 }} />
      </div>
      <div className={styles.skeletonBreadcrumb}>
        <div className={styles.shimmer} style={{ width: 200, height: 16, borderRadius: 4 }} />
      </div>
      <div className={styles.skeletonLayout}>
        <div className={styles.skeletonSidebar}>
          <div className={styles.skeletonCard}>
            <div className={styles.shimmer} style={{ width: 96, height: 96, borderRadius: '50%' }} />
            <div className={styles.shimmer} style={{ width: 160, height: 20, borderRadius: 6, marginTop: 16 }} />
            <div className={styles.shimmer} style={{ width: 100, height: 14, borderRadius: 4, marginTop: 8 }} />
            <div className={styles.shimmer} style={{ width: '100%', height: 44, borderRadius: 12, marginTop: 20 }} />
          </div>
          <div className={styles.skeletonCard}>
            <div className={styles.shimmer} style={{ width: 140, height: 16, borderRadius: 4 }} />
            <div className={styles.shimmer} style={{ width: '100%', height: 12, borderRadius: 4, marginTop: 12 }} />
            <div className={styles.shimmer} style={{ width: '80%', height: 12, borderRadius: 4, marginTop: 8 }} />
            <div className={styles.shimmer} style={{ width: '60%', height: 12, borderRadius: 4, marginTop: 8 }} />
          </div>
        </div>
        <div className={styles.skeletonMain}>
          <div className={styles.skeletonCard} style={{ padding: 20 }}>
            <div className={styles.shimmer} style={{ width: 60, height: 16, borderRadius: 4 }} />
            <div className={styles.shimmer} style={{ width: '100%', height: 14, borderRadius: 4, marginTop: 12 }} />
            <div className={styles.shimmer} style={{ width: '85%', height: 14, borderRadius: 4, marginTop: 6 }} />
          </div>
          <div className={styles.skeletonStats}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonStatCard}>
                <div className={styles.shimmer} style={{ width: 40, height: 24, borderRadius: 4 }} />
                <div className={styles.shimmer} style={{ width: 80, height: 10, borderRadius: 3, marginTop: 6 }} />
              </div>
            ))}
          </div>
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonListingCard}>
                <div className={styles.shimmer} style={{ width: '100%', aspectRatio: '4/3', borderRadius: 0 }} />
                <div style={{ padding: 12 }}>
                  <div className={styles.shimmer} style={{ width: '90%', height: 14, borderRadius: 4 }} />
                  <div className={styles.shimmer} style={{ width: 50, height: 10, borderRadius: 3, marginTop: 8 }} />
                  <div className={styles.shimmer} style={{ width: 80, height: 18, borderRadius: 4, marginTop: 10 }} />
                </div>
              </div>
            ))}
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
        <p className={styles.modalDesc}>Скопируйте ссылку и отправьте друзьям</p>
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

/* ═══ Main component ═══ */
export function PublicProfile() {
  const user = MOCK_PUBLIC_USER;
  const listings = MOCK_PUBLIC_LISTINGS;
  const reviews = MOCK_PUBLIC_REVIEWS;

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [showAllListings, setShowAllListings] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleHelpful = useCallback((id: string) => {
    setHelpfulReviews((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const visibleListings = useMemo(
    () => (showAllListings ? listings : listings.slice(0, VISIBLE_LISTINGS)),
    [listings, showAllListings],
  );
  const visibleReviews = useMemo(
    () => (showAllReviews ? reviews : reviews.slice(0, VISIBLE_REVIEWS)),
    [reviews, showAllReviews],
  );

  const initials = user.full_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

  const memberMonths = useMemo(() => {
    const diff = Date.now() - new Date(user.memberSince).getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24 * 30)));
  }, [user.memberSince]);

  const maxDistCount = Math.max(...RATING_DISTRIBUTION.map((r) => r.count));

  const profileUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://arendai.ru/user/${user.id}`;

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className={styles.page}>
      {/* ═══ Site header ═══ */}
      <CatalogHeader cityLabel={user.city} />

      {/* ── Breadcrumb bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href={ROUTES.home} className={styles.backLink}>
            <ArrowLeft size={16} />
            Каталог
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Профиль</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>{user.full_name}</span>
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
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarFallback}>{initials}</div>
                )}
              </div>
              {user.lastOnline === 'Онлайн' && <div className={styles.onlineDot} />}
            </div>

            <div className={styles.userName}>
              <h1>{user.full_name}</h1>
              {user.isVerified && <BadgeCheck size={18} className={styles.verifiedIcon} />}
            </div>
            {user.nickname && <span className={styles.userNickname}>@{user.nickname}</span>}

            {user.trustLevel === 'super' && (
              <div className={`${styles.trustBadge} ${styles.tooltipWrap}`}>
                <Award size={14} />
                {TRUST_LABELS[user.trustLevel]}
                <span className={styles.tooltipBubble}>Надёжный арендодатель с высоким рейтингом</span>
              </div>
            )}

            <div className={styles.quickStats}>
              <div className={`${styles.quickStat} ${styles.tooltipWrap}`}>
                <Star size={14} className={styles.starFilled} />
                <strong>{user.rating.toFixed(1)}</strong>
                <span className={styles.tooltipBubble}>Средняя оценка от арендаторов</span>
              </div>
              <span className={styles.quickStatSep} />
              <div className={`${styles.quickStat} ${styles.tooltipWrap}`}>
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
              <button type="button" className={styles.iconBtn} title="Поделиться" onClick={() => setShowShareModal(true)}>
                <Share2 size={15} />
              </button>
              <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Пожаловаться">
                <Flag size={14} />
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
                <li className={`${styles.verifyItem} ${styles.tooltipWrap}`}>
                  <CheckCircle2 size={15} />
                  Личность подтверждена
                  <span className={styles.tooltipBubble}>Паспорт проверен модератором</span>
                </li>
              )}
              <li className={`${styles.verifyItem} ${styles.tooltipWrap}`}>
                <CheckCircle2 size={15} />
                Номер телефона
                <span className={styles.tooltipBubble}>Телефон подтверждён по SMS</span>
              </li>
              <li className={`${styles.verifyItem} ${styles.tooltipWrap}`}>
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
                <span>На платформе с {formatMemberSince(user.memberSince)}</span>
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
            <div className={`${styles.statCard} ${styles.tooltipWrap}`}>
              <span className={styles.statVal}>{user.activeListings}</span>
              <span className={styles.statLabel}>Активных объявлений</span>
              <span className={styles.tooltipBubble}>Вещи, доступные для аренды сейчас</span>
            </div>
            <div className={`${styles.statCard} ${styles.tooltipWrap}`}>
              <span className={styles.statVal}>{user.completedDeals}</span>
              <span className={styles.statLabel}>Завершённых аренд</span>
              <span className={styles.tooltipBubble}>Успешно завершённых аренд</span>
            </div>
            <div className={`${styles.statCard} ${styles.tooltipWrap}`}>
              <span className={`${styles.statVal} ${styles.statValAccent}`}>{user.rating.toFixed(1)}</span>
              <span className={styles.statLabel}>Средний рейтинг</span>
              <span className={styles.tooltipBubble}>Средняя оценка от арендаторов</span>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className={styles.tabBar}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'listings' ? styles.tabActive : ''} ${styles.tooltipWrap}`}
              onClick={() => setActiveTab('listings')}
            >
              <Package size={16} />
              Объявления
              <span className={styles.tabCount}>{listings.length}</span>
              <span className={styles.tooltipBubble}>Вещи, которые можно арендовать</span>
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'reviews' ? styles.tabActive : ''} ${styles.tooltipWrap}`}
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
                        />
                      ))}
                    </div>

                    {!showAllListings && listings.length > VISIBLE_LISTINGS && (
                      <div className={styles.showMoreWrap}>
                        <button type="button" className={styles.showMoreBtn} onClick={() => setShowAllListings(true)}>
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
                      {visibleReviews.map((review, i) => {
                        const authorInitials = review.authorName
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2);

                        return (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05, ease: EASE }}
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
                                <button
                                  type="button"
                                  className={`${styles.helpfulBtn} ${helpfulReviews.has(review.id) ? styles.helpfulBtnActive : ''}`}
                                  onClick={() => toggleHelpful(review.id)}
                                >
                                  <ThumbsUp size={13} />
                                  {helpfulReviews.has(review.id) ? 'Полезно' : 'Полезный отзыв'}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {!showAllReviews && reviews.length > VISIBLE_REVIEWS && (
                      <div className={styles.showMoreWrap}>
                        <button type="button" className={styles.showMoreBtn} onClick={() => setShowAllReviews(true)}>
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
        {showShareModal && <ShareModal url={profileUrl} onClose={() => setShowShareModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
