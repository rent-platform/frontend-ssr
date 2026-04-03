import { ItemStatus } from "@/business/types/entity";

export type CatalogItemCardVM = {
  id: string;
  title: string;
  imageUrl: string | null;
  item_description: string | null;
  price_per_day: string | null;
  price_per_hour: string | null;
  deposit_amount: string;
  pickup_location: string | null;
  status: ItemStatus;
  views_count: number;
  created_at: string;
  location: string | null;
  isAvailable: boolean;
  dateAvailable: string;
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
