import type { ItemStatus } from "./catalog.types";
import type { DeepPartial } from "@/business/shared";

export type Photo = {
  id?: string;
  itemId?: string;
  photoUrl: string;
  sortOrder: number;
  createdAt?: string;
};

export type PhotosList = {
  photos: Photo[];
};

export type OwnerShortResponseDto = {
  id: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
};

export type CategoryResponseDto = {
  id: number;
  categoryName?: string | null;
  slug?: string | null;
  parentId?: number | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
};

export type PhotoResponseDto = {
  id?: string;
  photoUrl: string;
  sortOrder: number;
};

export type AdsItemResponseDto = {
  id: string;
  ownerId?: string;
  owner?: OwnerShortResponseDto | null;
  category?: CategoryResponseDto | null;
  title: string;
  itemDescription?: string | null;
  city?: string | null;
  pricePerDay?: number | null;
  pricePerHour?: number | null;
  depositAmount?: number | null;
  pickupLocation?: string | null;
  status: ItemStatus;
  moderationComment?: string | null;
  viewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  photos?: PhotoResponseDto[];
  mainPhotoUrl?: string | null;
  isFavorite?: boolean;
  isAvailable?: boolean;
  nearestAvailableDate?: string | null;
};

export type SortObjectDto = {
  empty?: boolean;
  sorted?: boolean;
  unsorted?: boolean;
};

export type AdsListResponseDto = {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: AdsItemResponseDto[];
  number: number;
  sort?: SortObjectDto;
  numberOfElements?: number;
  empty?: boolean;
};

export type AvailabilityResponseDto = {
  availableDate: string;
  isAvailable: boolean;
};

export type FetchAvailabilityArgs = {
  itemId: string;
  startDate: string;
  endDate: string;
};

export interface AdsFilterParams {
  categoryId?: number;
  search?: string;
  category?: string;
  subCategory?: string;
  priceFrom?: number;
  priceTo?: number;
  deposit?: boolean;
  city?: string;
  radius?: number;
  availableFrom?: string;
  availableTo?: string;
  minRating?: number;
  favoritesOnly?: boolean;
}

export interface FetchAdsArgs extends AdsFilterParams {
  pageSize?: number;
  pageNumber?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export type UpdatePlaylistArgs = DeepPartial<AdsCreateAd>;

export type AdsCreateAd = {
  categoryId?: number;
  title: string;
  itemDescription?: string | null;
  pricePerDay?: number | null;
  pricePerHour?: number | null;
  depositAmount?: number | null;
  city?: string;
  pickupLocation?: string | null;
  photos?: Array<{
    photoUrl?: string;
    sortOrder?: number;
  }>;
  nearestAvailableDate?: string | null;
};
