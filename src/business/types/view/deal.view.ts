import type {
  ChangeSource,
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

export type DealDetailsVM = DealCardVM;

export type DealStatusHistoryItemVM = {
  id: string;
  dealId: string;
  oldStatus: DealStatus | null;
  oldStatusLabel: string | null;
  newStatus: DealStatus;
  newStatusLabel: string;
  changedBy: string | null;
  changeSource: ChangeSource;
  comment: string | null;
  changedAt: string;
};

export type DealsListVM = {
  deals: DealCardVM[];
};
