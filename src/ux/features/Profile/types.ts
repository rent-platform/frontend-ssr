import type { ItemStatus, DealStatus } from '@/business/types/entity';

/* ═══ Profile overview ═══ */

export type ProfileUser = {
  id: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
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
  price_per_day: string | null;
  status: ItemStatus;
  views_count: number;
  bookingsCount: number;
  created_at: string;
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
  start_date: string;
  end_date: string;
  total_price: string;
  deposit_amount: string;
  status: DealStatus;
  created_at: string;
};

/* ═══ Tabs ═══ */

export type ProfileTab = 'overview' | 'listings' | 'deals';
