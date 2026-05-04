import { ItemStatus } from "./catalog.types";

export type CatalogItemBaseVM = {
  id: string;
  title: string;
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
};

export type CatalogItemDetailsVM = CatalogItemBaseVM & {
  description: string | null;
  photos: string[];
};

export type CatalogListVM = {
  items: CatalogItemCardVM[];
  total: number;
};

export type Availability = {
  item_id: string;
  date: string;
  is_available: boolean;
};


