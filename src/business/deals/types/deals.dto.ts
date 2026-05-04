import type { ChangeSource, DealStatus, PricingMode } from "./deal.types";

export type Deal = {
  id: string;
  item_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  pricing_mode: PricingMode;
  price_per_day_snapshot: string | null;
  price_per_hour_snapshot: string | null;
  total_price: string;
  deposit_amount: string;
  status: DealStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type DealStatusHistory = {
  id: string;
  deal_id: string;
  old_status: DealStatus | null;
  new_status: DealStatus;
  changed_by: string | null;
  change_source: ChangeSource;
  comment: string | null;
  changed_at: string;
};

export interface CreateDealRequestDto {
  adId: string;
  startDate: string;
  endDate: string;
  message?: string;
}

export interface RejectDealRequestDto {
  reason?: string;
}

export interface FetchDealsArgs {
  page?: number;
  limit?: number;
  search?: string;
}

export interface DealsListResponseDto {
  deals: Deal[];
}

export type DealStatusHistoryResponseDto = DealStatusHistory[];


