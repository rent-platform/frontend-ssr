export type TrustLevel = 'new' | 'verified' | 'experienced' | 'super';

export type PublicUser = {
  id: string;
  fullName: string;
  nickname: string | null;
  avatarUrl: string | null;
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
  lastOnline: string;
  languages: string[];
  trustLevel: TrustLevel;
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
