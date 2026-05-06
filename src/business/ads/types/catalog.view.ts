import { ItemStatus } from "./catalog.types";

export type CatalogItemBaseVM = {
  id: string;
  ownerId: string | null;
  title: string;
  category: string;
  categoryId: number | null;
  pricePerDay: string | null;
  pricePerHour: string | null;
  depositAmount: string;
  pickupLocation: string | null;
  status: ItemStatus;
  viewsCount: number;
  createdAt: string;
  isAvailable: boolean;
  nearestAvailableDate: string | null;
};

export type CatalogItemCardVM = CatalogItemBaseVM & {
  coverImageUrl: string | null;
  images: string[];
  ownerName: string;
  ownerAvatar: string | null;
  ownerRating: number | null;
  ownerReviewCount: number | null;
  itemRating: number | null;
  itemReviewCount: number | null;
};

export type CatalogItemDetailsVM = CatalogItemBaseVM & {
  description: string | null;
  photos: string[];
  ownerName: string;
  ownerAvatar: string | null;
  ownerRating: number | null;
  ownerReviewCount: number | null;
  itemRating: number | null;
  itemReviewCount: number | null;
};

export type CatalogListVM = {
  items: CatalogItemCardVM[];
  total: number;
};

export type Availability = {
  itemId: string;
  availableDate: string;
  isAvailable: boolean;
};


