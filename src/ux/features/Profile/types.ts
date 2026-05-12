import type { ItemStatus } from '@/business/ads/types';
import type { UiDealStatus } from '@/ux/types';

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
  images: string[];
  category: string;
  pricePerDay: string | null;
  pricePerHour: string | null;
  depositAmount: string | null;
  status: ItemStatus;
  viewsCount: number;
  bookingsCount: number;
  favoritesCount: number;
  messagesCount: number;
  location: string;
  description: string[];
  condition: string;
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
  status: UiDealStatus;
  createdAt: string;
};

/* ═══ Tabs ═══ */

export type ProfileTab = 'listings' | 'deals';
