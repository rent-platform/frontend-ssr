import type { ItemStatus } from "@/business/ads/types";
import type { DealStatus } from "@/business/deals/types";
import type { ProfileVM } from "@/business/profile";
import type { CatalogUiItem } from "../Catalog";
import type { ProfileListing } from "./types";
import styles from "./ProfileDashboard.module.scss";

type ProfileCompletionUser = Pick<
  ProfileVM,
  "avatarUrl" | "bio" | "phone" | "email" | "nickname"
>;

export type ListingFilter = "all" | ItemStatus;
export type BookingFilter = "all" | DealStatus;

export const DEAL_STATUS_MAP: Partial<Record<DealStatus, { label: string; cls: string }>> = {
  PENDING: { label: "Ожидает", cls: styles.statusNew },
  CONFIRMED: { label: "Подтверждена", cls: styles.statusConfirmed },
  PAYMENT_PENDING: { label: "Ожидает оплаты", cls: styles.statusConfirmed },
  PAID: { label: "Оплачена", cls: styles.statusConfirmed },
  ACTIVE: { label: "Активна", cls: styles.statusActive },
  COMPLETED: { label: "Завершена", cls: styles.statusCompleted },
  REJECTED: { label: "Отклонена", cls: styles.statusRejected },
  CANCELLED: { label: "Отменена", cls: styles.statusArchived },
};

export const LISTING_FILTERS: { value: ListingFilter; label: string; tip: string }[] = [
  { value: "all", label: "Все", tip: "Показать все объявления" },
  { value: "ACTIVE", label: "Активные", tip: "Опубликованы и доступны для аренды" },
  { value: "MODERATION", label: "Модерация", tip: "На проверке модератором" },
  { value: "DRAFT", label: "Черновики", tip: "Можно отправить на модерацию" },
  { value: "REJECTED", label: "Отклоненные", tip: "Можно вернуть в черновик и исправить" },
  { value: "ARCHIVED", label: "Архив", tip: "Сняты с публикации" },
];

export const BOOKING_FILTERS: { value: BookingFilter; label: string; tip: string }[] = [
  { value: "all", label: "Все", tip: "Показать все аренды" },
  { value: "ACTIVE", label: "Активные", tip: "Вещь сейчас у арендатора" },
  { value: "PAID", label: "Оплаченные", tip: "Ожидают подтверждения старта аренды" },
  { value: "PAYMENT_PENDING", label: "Ожидают оплаты", tip: "Счет выставлен, арендатор еще не оплатил" },
  { value: "CONFIRMED", label: "Подтвержденные", tip: "Ожидают начала аренды" },
  { value: "COMPLETED", label: "Завершенные", tip: "Аренда успешно завершена" },
  { value: "REJECTED", label: "Отклоненные", tip: "Запрос на аренду отклонен" },
];

export function profileListingToCatalogItem(
  listing: ProfileListing,
  owner?: ProfileVM | null,
): CatalogUiItem {
  return {
    id: listing.id,
    ownerId: owner?.id ?? null,
    title: listing.title,
    coverImageUrl: listing.image ?? "",
    images: listing.image ? [listing.image] : [],
    category: listing.category,
    categoryId: null,
    pricePerDay: listing.pricePerDay ?? null,
    pricePerHour: null,
    depositAmount: "",
    pickupLocation: "Новосибирск",
    status: listing.status,
    isAvailable: listing.status === "ACTIVE",
    viewsCount: listing.viewsCount,
    createdAt: listing.createdAt,
    nearestAvailableDate: null,
    ownerName: owner?.nickname ?? owner?.fullName ?? "",
    ownerAvatar: owner?.avatarUrl ?? null,
    ownerRating: null,
    ownerReviewCount: null,
    itemRating: null,
    itemReviewCount: null,
    quickFilters: [],
    featured: listing.bookingsCount > 10,
  };
}

export function getProfileCompletion(user: ProfileCompletionUser): number {
  let score = 0;
  if (user.avatarUrl) score += 20;
  if (user.bio) score += 20;
  if (user.phone) score += 20;
  if (user.email) score += 20;
  if (user.nickname) score += 10;
  score += 10;
  return Math.min(score, 100);
}
