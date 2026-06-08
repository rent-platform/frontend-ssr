"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
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
} from "lucide-react";
import { CatalogHeader, CatalogFooter } from "../Catalog";
import clsx from "clsx";
import { pluralize, formatDate, getInitials, ROUTES, EASE } from "@/ux/utils";
import type { ProfileTab, BookingSide } from "./types";
import type { ProfileDashboardVM } from "@/business/profile";
import { getProfileCompletion } from "./profileHelpers";
import type { ListingFilter, BookingFilter } from "./profileHelpers";
import { ListingsPanel } from "./components/ListingsPanel";
import { DealsPanel } from "./components/DealsPanel";
import { DashboardSkeleton } from "./components/DashboardSkeleton";
import { VerifyChip } from "./components/VerifyChip";
import { TabBtn } from "./components/TabBtn";
import { ShareModal } from "@/ux/components/ShareModal";
import {
  closeModal,
  openModal,
  setActiveProfileTab,
  setProfileDealFilter,
  setProfileListingFilter,
  useAppDispatch,
  useAppSelector,
} from "@/business/shared";
import styles from "./ProfileDashboard.module.scss";

/* ═══════════════════════════════════════════════════════════════════════════════
   ProfileDashboard
   ═══════════════════════════════════════════════════════════════════════════════ */
export type ProfileDashboardProps = {
  dashboard?: ProfileDashboardVM | null;
  /** True while loading from API. */
  isLoading?: boolean;
};

export function ProfileDashboard({
  dashboard: externalDashboard,
  isLoading: externalLoading,
}: ProfileDashboardProps = {}) {
  const dispatch = useAppDispatch();
  const profileUi = useAppSelector((state) => state.profileUi);
  const modal = useAppSelector((state) => state.ui.modal);
  const tab = profileUi.activeProfileTab as ProfileTab;
  const listingFilter = profileUi.listingFilter as ListingFilter;
  const [dealSide, setDealSide] = useState<BookingSide>("owner");
  const dealFilter = profileUi.dealFilter as BookingFilter;

  const user = externalDashboard?.user ?? null;
  const stats = externalDashboard?.stats ?? null;
  const isLoading = externalLoading ?? !externalDashboard;

  if (isLoading || !user || !stats) return <DashboardSkeleton />;

  const initials = getInitials(user.fullName);
  const profileCompletion = getProfileCompletion(user);
  const rating = user.rating;
  const reviewCount = user.reviewCount;
  const memberSince = user.memberSince;
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/user/${user.id}`
      : `https://arendai.ru/user/${user.id}`;

  return (
    <div className={styles.page}>
      <CatalogHeader cityLabel="Новосибирск" />

      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href={ROUTES.home} className={styles.backLink}>
            <ArrowLeft size={15} /> Каталог
          </Link>
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
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarFallback}>{initials}</div>
                )}
              </div>
              <button
                type="button"
                className={styles.avatarEdit}
                aria-label="Изменить фото"
              >
                <Camera size={11} />
              </button>
            </div>

            <div className={styles.nameBlock}>
              <div className={styles.nameRow}>
                <h1>{user.fullName}</h1>
                <BadgeCheck size={18} className={styles.verifiedBadge} />
              </div>
              {user.nickname && (
                <span className={styles.nickname}>@{user.nickname}</span>
              )}
            </div>

            <div className={styles.profileActions}>
              <Link href={ROUTES.settings} className={styles.btnPrimary}>
                <Edit3 size={15} /> Редактировать
              </Link>
              <button
                type="button"
                className={styles.btnIcon}
                onClick={() =>
                  dispatch(
                    openModal({ type: "share", payload: { url: profileUrl } }),
                  )
                }
                title="Поделиться"
              >
                <Share2 size={17} />
              </button>
              <Link
                href={ROUTES.publicProfile(user.id)}
                className={styles.btnIcon}
                title="Публичный профиль"
              >
                <Eye size={17} />
              </Link>
            </div>
          </div>

          <div className={styles.profileBody}>
            {user.bio && <p className={styles.bio}>{user.bio}</p>}

            <div className={styles.metaRow}>
              <Link href={ROUTES.reviews} className={styles.ratingChip}>
                <Star size={13} />
                {rating.toFixed(1)}
                <span className={styles.ratingCount}>
                  ({reviewCount}{" "}
                  {pluralize(reviewCount, "отзыв", "отзыва", "отзывов")})
                </span>
              </Link>
              {memberSince && (
                <>
                  <span className={styles.metaDot}>·</span>
                  <span className={styles.metaItem}>
                    <Calendar size={13} /> С {formatDate(memberSince)}
                  </span>
                </>
              )}
              {user.phone && (
                <>
                  <span className={styles.metaDot}>·</span>
                  <span className={styles.metaItem}>
                    <Phone size={13} /> {user.phone}
                  </span>
                </>
              )}
            </div>

            <div className={styles.verifyRow}>
              <VerifyChip
                icon={<CheckCircle2 size={13} />}
                label="Телефон"
                done
                tooltip="Номер телефона подтверждён"
              />
              <VerifyChip
                icon={<Mail size={13} />}
                label="Email"
                done
                tooltip="Электронная почта подтверждена"
              />
              <VerifyChip
                icon={<Shield size={13} />}
                label="Паспорт"
                done={false}
                tooltip="Пройдите верификацию документа"
              />
              <VerifyChip
                icon={<BadgeCheck size={13} />}
                label="Фото"
                done
                tooltip="Фото профиля подтверждено"
              />
            </div>
          </div>

          {profileCompletion < 100 && (
            <div className={styles.completionStrip}>
              <Zap size={14} />
              <span>
                Профиль заполнен на <strong>{profileCompletion}%</strong>
              </span>
              <div className={styles.completionTrack}>
                <div
                  className={styles.completionFill}
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <Link href={ROUTES.settings} className={styles.completionLink}>
                Заполнить →
              </Link>
            </div>
          )}

          <div className={styles.statsGrid}>
            <div className={clsx(styles.statCard, styles.tooltipWrap)}>
              <span className={styles.statNum}>{stats.activeListings}</span>
              <span className={styles.statLbl}>Объявлений</span>
              <span className={styles.tooltipBubble}>
                Активных объявлений на платформе
              </span>
            </div>
            <div className={clsx(styles.statCard, styles.tooltipWrap)}>
              <span className={styles.statNum}>{stats.completedBookings}</span>
              <span className={styles.statLbl}>Сдано</span>
              <span className={styles.tooltipBubble}>
                Успешных сдач в аренду
              </span>
            </div>
            <div className={clsx(styles.statCard, styles.tooltipWrap)}>
              <span className={styles.statNum}>{stats.rentedCount}</span>
              <span className={styles.statLbl}>Арендовано</span>
              <span className={styles.tooltipBubble}>Вещей взято в аренду</span>
            </div>
            <div className={clsx(styles.statCard, styles.tooltipWrap)}>
              <span className={clsx(styles.statNum, styles.statNumAccent)}>
                {rating.toFixed(1)}
              </span>
              <span className={styles.statLbl}>Рейтинг</span>
              <span className={styles.tooltipBubble}>
                Средняя оценка от пользователей
              </span>
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
          <TabBtn
            active={tab === "listings"}
            label="Мои объявления"
            count={stats.totalListings}
            onClick={() => dispatch(setActiveProfileTab("listings"))}
            tooltip="Вещи, которые вы выставили на аренду"
          />
          <TabBtn
            active={tab === "deals"}
            label="Мои аренды"
            count={stats.totalDeals}
            onClick={() => dispatch(setActiveProfileTab("deals"))}
            tooltip="История сдачи и аренды вещей"
          />
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
            {tab === "listings" && (
              <ListingsPanel
                filter={listingFilter}
                onFilterChange={(filter) =>
                  dispatch(setProfileListingFilter(filter))
                }
              />
            )}
            {tab === "deals" && (
              <DealsPanel
                side={dealSide}
                onSideChange={setDealSide}
                filter={dealFilter}
                onFilterChange={(filter) =>
                  dispatch(setProfileDealFilter(filter))
                }
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <CatalogFooter />

      <AnimatePresence>
        {modal.type === "share" && typeof modal.payload?.url === "string" && (
          <ShareModal
            url={modal.payload.url}
            onClose={() => dispatch(closeModal())}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

