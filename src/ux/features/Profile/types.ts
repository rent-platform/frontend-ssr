import type { ItemStatus } from '@/business/ads/types';
import type { DealStatus } from '@/business/deals/types';

/* ═══ Profile overview ═══ */

export type ProfileUser = {
  id: string;
  fullName: string;
  nickname: string | null;
  avatarUrl: string | null;
  bio: string | null;
  phone: string;
  email: string | null;
  rating: number;
  reviewCount: number;
  memberSince: string;
};

export type ProfileStats = {
  activeListings: number;
  totalListings: number;
  activeBookings: number;
  completedBookings: number;
  rentedCount: number;
  totalEarnings: string;
  totalSpent: string;
  responseRate: number;
};

/* ═══ My Listings ═══ */

export type ProfileListing = {
  id: string;
  title: string;
  image: string | null;
  category: string;
  pricePerDay: string | null;
  status: ItemStatus;
  viewsCount: number;
  bookingsCount: number;
  createdAt: string;
};

/* ═══ Booking History ═══ */

export type BookingSide = 'renter' | 'owner';

export type ProfileBooking = {
  id: string;
  itemTitle: string;
  itemImage: string | null;
  counterpartyName: string;
  counterpartyAvatar: string | null;
  side: BookingSide;
  startDate: string;
  endDate: string;
  totalPrice: string;
  depositAmount: string;
  status: DealStatus;
  createdAt: string;
};

/* ═══ Tabs ═══ */

export type ProfileTab = 'listings' | 'deals';
