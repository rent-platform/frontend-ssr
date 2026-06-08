import type { UserRole } from "@/business/auth";

export type ProfileVM = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
};

export type ProfileDashboardUserVM = ProfileVM & {
  rating: number;
  reviewCount: number;
  memberSince: string | null;
};

export type ProfileDashboardStatsVM = {
  activeListings: number;
  totalListings: number;
  totalDeals: number;
  activeBookings: number;
  completedBookings: number;
  rentedCount: number;
  totalEarnings: string;
  totalSpent: string;
  responseRate: number;
};

export type ProfileDashboardVM = {
  user: ProfileDashboardUserVM;
  stats: ProfileDashboardStatsVM;
};

