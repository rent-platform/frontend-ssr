import type {
  DealStatus,
  PricingMode,
} from "@/business/types/entity/deal.types";

export type DealCardVM = {
  id: string;
  itemId: string;
  renterId: string;
  ownerId: string;
  status: DealStatus;
  statusLabel: string;
  startDate: string;
  endDate: string;
  totalPrice: string;
  depositAmount: string;
  pricingMode: PricingMode;
  pricePerPeriod: string;
  createdAt: string;
};

export type DealsListVM = {
  deals: DealCardVM[];
};
