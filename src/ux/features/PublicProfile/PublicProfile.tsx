'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Flag,
  Globe,
  ImageIcon,
  Info,
  MapPin,
  MessageCircle,
  Package,
  Share2,
  Shield,
  ShieldCheck,
  Star,
  ThumbsUp,
  Zap,
} from 'lucide-react';
import { CatalogHeader } from '../Catalog/components/CatalogHeader';
import { CatalogFooter } from '../Catalog/components/CatalogFooter';
import { MOCK_PUBLIC_USER, MOCK_PUBLIC_LISTINGS, MOCK_PUBLIC_REVIEWS } from './mockPublicProfileData';
import type { TrustLevel } from './types';
import styles from './PublicProfile.module.scss';

const EASE = [0.23, 1, 0.32, 1] as const;
const VISIBLE_LISTINGS = 6;
const VISIBLE_REVIEWS = 4;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatMemberSince(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

function pluralize(n: number, one: string, few: string, many: string) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
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

export function PublicProfile() {
  const user = MOCK_PUBLIC_USER;
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

  return (
    <div className={styles.page}>
      {/* ═══ Site header ═══ */}
      <CatalogHeader cityLabel={user.city} />

      {/* ── Breadcrumb bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/dev-ui" className={styles.backLink}>
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
              <div className={styles.trustBadge}>
                <Award size={14} />
                {TRUST_LABELS[user.trustLevel]}
              </div>
            )}

            <div className={styles.quickStats}>
              <div className={styles.quickStat}>
                <Star size={14} className={styles.starFilled} />
                <strong>{user.rating.toFixed(1)}</strong>
              </div>
              <span className={styles.quickStatSep} />
              <div className={styles.quickStat}>
                <strong>{user.reviewCount}</strong>
                <span>{pluralize(user.reviewCount, 'отзыв', 'отзыва', 'отзывов')}</span>
              </div>
              <span className={styles.quickStatSep} />
              <div className={styles.quickStat}>
                <strong>{memberMonths}</strong>
                <span>{pluralize(memberMonths, 'месяц', 'месяца', 'месяцев')}</span>
              </div>
            </div>

            <Link href="/dev-ui/chat" className={styles.ctaBtn}>
              <MessageCircle size={16} />
              Написать сообщение
            </Link>

            <div className={styles.secondaryActions}>
              <button type="button" className={styles.iconBtn} title="Поделиться">
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
                <li className={styles.verifyItem}>
                  <CheckCircle2 size={15} />
                  Личность подтверждена
                </li>
              )}
              <li className={styles.verifyItem}>
                <CheckCircle2 size={15} />
                Номер телефона
              </li>
              <li className={styles.verifyItem}>
                <CheckCircle2 size={15} />
                Электронная почта
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
              <div className={styles.aboutRow}>
                <Zap size={15} />
                <span>Отвечает {user.responseTime}</span>
              </div>
              <div className={styles.aboutRow}>
                <ThumbsUp size={15} />
                <span>{user.responseRate}% отклик</span>
              </div>
              <div className={styles.aboutRow}>
                <Package size={15} />
                <span>{user.completedDeals} успешных сделок</span>
              </div>
              {user.languages.length > 0 && (
                <div className={styles.aboutRow}>
                  <Globe size={15} />
                  <span>{user.languages.join(', ')}</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            className={styles.contactNote}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16, ease: EASE }}
          >
            <Info size={14} />
            <span>Контактные данные предоставляются после подтверждения бронирования</span>
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
            <div className={styles.statCard}>
              <span className={styles.statVal}>{user.activeListings}</span>
              <span className={styles.statLabel}>Активных объявлений</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal}>{user.completedDeals}</span>
              <span className={styles.statLabel}>Завершённых сделок</span>
            </div>
            <div className={styles.statCard}>
              <span className={`${styles.statVal} ${styles.statValAccent}`}>{user.rating.toFixed(1)}</span>
              <span className={styles.statLabel}>Средний рейтинг</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal}>{user.responseRate}%</span>
              <span className={styles.statLabel}>Частота отклика</span>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className={styles.tabBar}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'listings' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('listings')}
            >
              <Package size={16} />
              Объявления
              <span className={styles.tabCount}>{listings.length}</span>
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'reviews' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={16} />
              Отзывы
              <span className={styles.tabCount}>{user.reviewCount}</span>
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
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}
                        >
                          <Link href={`/dev-ui/listing/${item.id}`} className={styles.listingLink}>
                            <div className={styles.listingCard}>
                              <div className={styles.listingImage}>
                                {item.image ? (
                                  <img src={item.image} alt={item.title} />
                                ) : (
                                  <div className={styles.listingPlaceholder}><ImageIcon size={28} /></div>
                                )}
                                <span className={`${styles.availBadge} ${item.isAvailable ? styles.availBadgeYes : styles.availBadgeNo}`}>
                                  {item.isAvailable ? <><Zap size={11} /> Доступно</> : <><Clock3 size={11} /> Занято</>}
                                </span>
                              </div>
                              <div className={styles.listingBody}>
                                <h3 className={styles.listingTitle}>{item.title}</h3>
                                <span className={styles.listingCategory}>{item.category}</span>
                                <div className={styles.listingFooter}>
                                  <span className={styles.listingPrice}>{item.pricePerDay} ₽<small>/сут</small></span>
                                  <span className={styles.listingRating}>
                                    <Star size={12} /> {item.rating.toFixed(1)}
                                    <span>({item.reviewCount})</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
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
                    <p>Отзывы появятся после завершённых сделок</p>
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
            <strong>Безопасные сделки на платформе Арендай</strong>
            <p>Все арендодатели проходят верификацию. Вещи застрахованы, оплата через безопасную сделку.</p>
          </div>
        </div>
      </div>

      <CatalogFooter />
    </div>
  );
}
