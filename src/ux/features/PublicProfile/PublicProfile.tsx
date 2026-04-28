'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock3,
  Flag,
  ImageIcon,
  MapPin,
  MessageCircle,
  Package,
  Share2,
  Shield,
  Star,
  ThumbsUp,
  Zap,
} from 'lucide-react';
import { CatalogFooter } from '../Catalog/components/CatalogFooter';
import { MOCK_PUBLIC_USER, MOCK_PUBLIC_LISTINGS, MOCK_PUBLIC_REVIEWS } from './mockPublicProfileData';
import styles from './PublicProfile.module.scss';

const EASE = [0.23, 1, 0.32, 1] as const;
const VISIBLE_LISTINGS = 6;
const VISIBLE_REVIEWS = 3;

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

/* ═══════════════════════════════════════════════════════════════════════════════
   Rating breakdown — shows star distribution bar
   ═══════════════════════════════════════════════════════════════════════════════ */
const RATING_DISTRIBUTION = [
  { stars: 5, count: 68 },
  { stars: 4, count: 12 },
  { stars: 3, count: 5 },
  { stars: 2, count: 1 },
  { stars: 1, count: 1 },
];

function RatingBreakdown({ rating, total }: { rating: number; total: number }) {
  const maxCount = Math.max(...RATING_DISTRIBUTION.map((r) => r.count));

  return (
    <div className={styles.ratingBreakdown}>
      <div className={styles.ratingBig}>
        <span className={styles.ratingBigValue}>{rating.toFixed(1)}</span>
        <div className={styles.ratingBigStars}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className={i < Math.round(rating) ? styles.starFilled : styles.starEmpty} />
          ))}
        </div>
        <span className={styles.ratingBigCount}>{total} {pluralize(total, 'отзыв', 'отзыва', 'отзывов')}</span>
      </div>
      <div className={styles.ratingBars}>
        {RATING_DISTRIBUTION.map((row) => (
          <div key={row.stars} className={styles.ratingBarRow}>
            <span className={styles.ratingBarLabel}>{row.stars}</span>
            <Star size={11} className={styles.starFilled} />
            <div className={styles.ratingBarTrack}>
              <div
                className={styles.ratingBarFill}
                style={{ width: maxCount > 0 ? `${(row.count / maxCount) * 100}%` : '0%' }}
              />
            </div>
            <span className={styles.ratingBarCount}>{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PublicProfile
   ═══════════════════════════════════════════════════════════════════════════════ */
export function PublicProfile() {
  const user = MOCK_PUBLIC_USER;
  const listings = MOCK_PUBLIC_LISTINGS;
  const reviews = MOCK_PUBLIC_REVIEWS;

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

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* ── Back ── */}
        <Link href="/dev-ui" className={styles.backLink}>
          <ArrowLeft size={18} />
          <span>Назад в каталог</span>
        </Link>

        {/* ═══ Hero ═══ */}
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
                  <img src={user.avatar_url} alt={user.full_name} className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarFallback}>{initials}</div>
                )}
              </div>
              <div className={styles.onlineDot} />
            </div>

            {/* Info */}
            <div className={styles.heroInfo}>
              <div className={styles.nameRow}>
                <h1>{user.full_name}</h1>
                {user.isVerified && <BadgeCheck size={20} className={styles.verifiedIcon} />}
                {user.nickname && <span className={styles.nickname}>@{user.nickname}</span>}
              </div>

              {user.bio && <p className={styles.bio}>{user.bio}</p>}

              <div className={styles.metaRow}>
                <span className={styles.ratingChip}>
                  <Star size={13} />
                  {user.rating.toFixed(1)}
                  <span className={styles.ratingCount}>({user.reviewCount} отзывов)</span>
                </span>
                <span className={styles.metaSep}>·</span>
                <span className={styles.metaChip}><MapPin size={13} /> {user.city}</span>
                <span className={styles.metaSep}>·</span>
                <span className={styles.metaChip}><Calendar size={13} /> На платформе {memberMonths} {pluralize(memberMonths, 'месяц', 'месяца', 'месяцев')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.heroActions}>
              <Link href="/dev-ui/chat" className={styles.btnPrimary}>
                <MessageCircle size={15} /> Написать
              </Link>
              <button type="button" className={styles.btnGhost} title="Поделиться">
                <Share2 size={15} />
              </button>
              <button type="button" className={styles.btnGhostDanger} title="Пожаловаться">
                <Flag size={14} />
              </button>
            </div>
          </div>

          {/* Counters */}
          <div className={styles.counters}>
            <div className={styles.counter}>
              <span className={styles.counterVal}>{user.activeListings}</span>
              <span className={styles.counterLbl}>Объявлений</span>
            </div>
            <div className={styles.counterDiv} />
            <div className={styles.counter}>
              <span className={styles.counterVal}>{user.completedDeals}</span>
              <span className={styles.counterLbl}>Сделок</span>
            </div>
            <div className={styles.counterDiv} />
            <div className={styles.counter}>
              <span className={styles.counterVal}>{user.responseRate}%</span>
              <span className={styles.counterLbl}>Отклик</span>
            </div>
            <div className={styles.counterDiv} />
            <div className={styles.counter}>
              <span className={`${styles.counterVal} ${styles.counterValAccent}`}>{user.rating.toFixed(1)}</span>
              <span className={styles.counterLbl}>Рейтинг</span>
            </div>
          </div>
        </motion.div>

        {/* ═══ Trust badges ═══ */}
        <motion.div
          className={styles.trustBar}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
        >
          {user.isVerified && (
            <span className={`${styles.trustBadge} ${styles.trustBadgeDone}`}>
              <CheckCircle2 size={15} /> Личность подтверждена
            </span>
          )}
          <span className={`${styles.trustBadge} ${styles.trustBadgeDone}`}>
            <Zap size={15} /> Отвечает {user.responseTime}
          </span>
          <span className={`${styles.trustBadge} ${styles.trustBadgeDone}`}>
            <ThumbsUp size={15} /> {user.responseRate}% отклик
          </span>
          <span className={`${styles.trustBadge} ${styles.trustBadgeDone}`}>
            <Shield size={15} /> {user.completedDeals} успешных сделок
          </span>
          <span className={`${styles.trustBadge} ${styles.trustBadgeDone}`}>
            <Package size={15} /> {user.activeListings} активных объявлений
          </span>
        </motion.div>

        {/* ═══ About card ═══ */}
        <motion.div
          className={styles.aboutCard}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12, ease: EASE }}
        >
          <h2 className={styles.aboutTitle}>О пользователе</h2>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutItem}>
              <Calendar size={16} />
              <div>
                <strong>На платформе с</strong>
                <span>{formatMemberSince(user.memberSince)}</span>
              </div>
            </div>
            <div className={styles.aboutItem}>
              <MapPin size={16} />
              <div>
                <strong>Город</strong>
                <span>{user.city}</span>
              </div>
            </div>
            <div className={styles.aboutItem}>
              <Zap size={16} />
              <div>
                <strong>Среднее время ответа</strong>
                <span>{user.responseTime}</span>
              </div>
            </div>
            <div className={styles.aboutItem}>
              <Shield size={16} />
              <div>
                <strong>Завершённых сделок</strong>
                <span>{user.completedDeals}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ Listings ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
        >
          <div className={styles.sectionHeader}>
            <h2>Объявления {user.full_name.split(' ')[0]}</h2>
            <span>{listings.length} {pluralize(listings.length, 'объявление', 'объявления', 'объявлений')}</span>
          </div>

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
                    <div className={styles.listingCard}>
                      <div className={styles.listingImage}>
                        {item.image ? (
                          <img src={item.image} alt={item.title} />
                        ) : (
                          <div className={styles.listingPlaceholder}><ImageIcon size={28} /></div>
                        )}
                        <span className={`${styles.availBadge} ${item.isAvailable ? styles.availBadgeYes : styles.availBadgeNo}`}>
                          {item.isAvailable ? <><Zap size={12} /> Доступно</> : <><Clock3 size={12} /> Занято</>}
                        </span>
                      </div>
                      <div className={styles.listingBody}>
                        <h3 className={styles.listingTitle}>{item.title}</h3>
                        <div className={styles.listingCategory}>{item.category}</div>
                        <div className={styles.listingFooter}>
                          <span className={styles.listingPrice}>{item.pricePerDay} ₽<small>/сут</small></span>
                          <span className={styles.listingRating}>
                            <Star size={13} /> {item.rating.toFixed(1)}
                            <span>({item.reviewCount})</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {!showAllListings && listings.length > VISIBLE_LISTINGS && (
                <div className={styles.showMoreWrap}>
                  <button type="button" className={styles.showMoreBtn} onClick={() => setShowAllListings(true)}>
                    Показать все {listings.length} объявлений
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <ImageIcon />
              <h3>Нет объявлений</h3>
              <p>Пользователь ещё не добавил объявления</p>
            </div>
          )}
        </motion.section>

        {/* ═══ Rating breakdown + Reviews ═══ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
        >
          <div className={styles.sectionHeader}>
            <h2>Отзывы</h2>
            <span>{user.reviewCount} {pluralize(user.reviewCount, 'отзыв', 'отзыва', 'отзывов')}</span>
          </div>

          <RatingBreakdown rating={user.rating} total={user.reviewCount} />

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
                            <span className={styles.reviewItemLabel}>{review.itemTitle}</span>
                          </div>
                          <span className={styles.reviewDate}>{formatDate(review.date)}</span>
                        </div>
                        <div className={styles.reviewStars}>
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star key={si} size={14} className={si < review.rating ? styles.starFilled : styles.starEmpty} />
                          ))}
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
                    Показать все {reviews.length} отзывов
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <Star />
              <h3>Пока нет отзывов</h3>
              <p>Отзывы появятся после завершённых сделок</p>
            </div>
          )}
        </motion.section>

      </div>

      {/* ═══ Footer ═══ */}
      <CatalogFooter />
    </div>
  );
}
