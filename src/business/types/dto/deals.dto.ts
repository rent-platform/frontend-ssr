import type { Deal, DealStatusHistory } from "@/business/types/entity/deal.types";

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
