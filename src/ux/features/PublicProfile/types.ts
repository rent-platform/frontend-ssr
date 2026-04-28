export type PublicUser = {
  id: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  rating: number;
  reviewCount: number;
  memberSince: string;
  city: string;
  isVerified: boolean;
  responseTime: string;
  responseRate: number;
  completedDeals: number;
  activeListings: number;
};

export type PublicListing = {
  id: string;
  title: string;
  image: string | null;
  category: string;
  pricePerDay: string;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
};

export type PublicReview = {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  rating: number;
  text: string;
  date: string;
  itemTitle: string;
};
