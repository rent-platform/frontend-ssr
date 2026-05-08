import type { AdsItemResponseDto, ItemStatus } from '@/business/ads';
import type { Deal, DealStatus } from '@/business/deals';
import type { Payment, PaymentStatus } from '@/business/payments';
import type { UserResponseDTO, UserRole } from '@/business/auth';
import type { ReviewDTO } from '@/business/reviews';

/* ── Dashboard ───────────────────────────────────────────────────────────── */

export type AdminStatWidget = {
  key: string;
  label: string;
  value: number;
  formatted: string;
  trend?: number;
  trendLabel?: string;
  color: 'green' | 'blue' | 'orange' | 'red' | 'purple';
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type DashboardData = {
  stats: AdminStatWidget[];
  usersChart: ChartPoint[];
  dealsChart: ChartPoint[];
  revenueChart: ChartPoint[];
  recentDeals: AdminDeal[];
  topCategories: { name: string; count: number; revenue: number }[];
};

/* ── Users management ────────────────────────────────────────────────────── */

export type AdminUser = {
  id: string;
  email: string | null;
  phone: string;
  fullName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  listingsCount: number;
  dealsCount: number;
};

export type UsersFilter = {
  search: string;
  role: UserRole | 'all';
  status: 'all' | 'active' | 'banned';
};

/* ── Listings management ─────────────────────────────────────────────────── */

export type AdminListing = AdsItemResponseDto & {
  ownerName: string;
  ownerPhone: string;
  dealsCount: number;
  revenue: number;
};

export type ListingsFilter = {
  search: string;
  status: ItemStatus | 'all';
  category: string;
};

/* ── Deals management ────────────────────────────────────────────────────── */

export type AdminDeal = Deal & {
  itemTitle: string;
  renterName: string;
  ownerName: string;
};

export type DealsFilter = {
  search: string;
  status: DealStatus | 'all';
};

/* ── Finance ─────────────────────────────────────────────────────────────── */

export type AdminPayment = Payment & {
  dealId: string;
  itemTitle: string;
  renterName: string;
  ownerName: string;
  createdAt: string;
};

export type FinanceFilter = {
  search: string;
  status: PaymentStatus | 'all';
};

export type FinanceSummary = {
  totalRevenue: number;
  totalDeposits: number;
  pendingPayments: number;
  refundsTotal: number;
};

/* ── Platform settings ───────────────────────────────────────────────────── */

export type PlatformCategory = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
  itemsCount: number;
};

export type PlatformSettings = {
  commissionPercent: number;
  minRentalHours: number;
  maxDepositPercent: number;
  autoApproveListings: boolean;
  maxPhotosPerListing: number;
  maxListingsPerUser: number;
  categories: PlatformCategory[];
};

/* ── Activity Log ────────────────────────────────────────────────────────── */

export type ActivityActionType =
  | 'user_ban'
  | 'user_unban'
  | 'user_role_change'
  | 'listing_archive'
  | 'listing_approve'
  | 'listing_reject'
  | 'deal_cancel'
  | 'payment_refund'
  | 'settings_change'
  | 'complaint_resolve'
  | 'review_delete';

export type ActivityLogEntry = {
  id: string;
  action: ActivityActionType;
  actionLabel: string;
  targetType: 'user' | 'listing' | 'deal' | 'payment' | 'review' | 'complaint' | 'settings';
  targetId: string;
  targetTitle: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  details?: string;
};

export type ActivityLogFilter = {
  search: string;
  action: ActivityActionType | 'all';
  dateFrom: string;
  dateTo: string;
};

/* ── Analytics ──────────────────────────────────────────────────────────── */

export type AnalyticsData = {
  conversionRate: number;
  conversionTrend: number;
  averageCheck: number;
  averageCheckTrend: number;
  retentionRate: number;
  retentionTrend: number;
  viewsToDeals: number;
  viewsToDealsTrend: number;
};

/* ── Today activity ─────────────────────────────────────────────────────── */

export type TodayActivity = {
  newRegistrations: number;
  newListings: number;
  newDeals: number;
  newComplaints: number;
};

/* ── Admin notification ─────────────────────────────────────────────────── */

export type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
};

/* ── Admin tabs ──────────────────────────────────────────────────────────── */

export type AdminTab = 'dashboard' | 'users' | 'listings' | 'deals' | 'finance' | 'complaints' | 'settings' | 'activity';
