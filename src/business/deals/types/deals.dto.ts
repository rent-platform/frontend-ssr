import type { ChangeSource, DealStatus, PricingMode } from "./deal.types";

export type DealStatusHistory = {
  id: string;
  dealId: string;
  oldStatus: DealStatus | null;
  newStatus: DealStatus;
  changedBy: string | null;
  changeSource: ChangeSource;
  comment: string | null;
  changedAt: string;
};

export type Deal = {
  id: string;
  itemId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  pricingMode: PricingMode;
  pricePerDaySnapshot?: number | null;
  pricePerHourSnapshot?: number | null;
  totalPrice: number;
  depositAmount: number;
  status: DealStatus;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  history?: DealStatusHistory[];
};

export type DealShortResponseDto = {
  id: string;
  itemId: string;
  renterId: string;
  ownerId: string;
  status: DealStatus;
  pricingMode: PricingMode;
  totalPrice: number;
  depositAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export interface CreateDealRequestDto {
  itemId: string;
  startDate: string;
  endDate: string;
  pricingMode: PricingMode;
}

export interface RejectDealRequestDto {
  reason: string;
}

export interface CancelDealRequestDto {
  reason: string;
}

export interface FetchDealsArgs {
  status?: DealStatus;
  page?: number;
  size?: number;
  sort?: string[];
}

export type SortObjectDto = {
  empty?: boolean;
  sorted?: boolean;
  unsorted?: boolean;
};

export type PageableObjectDto = {
  offset?: number;
  sort?: SortObjectDto;
  paged?: boolean;
  pageNumber?: number;
  pageSize?: number;
  unpaged?: boolean;
};

export interface DealsListResponseDto {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: DealShortResponseDto[];
  number: number;
  sort?: SortObjectDto;
  numberOfElements?: number;
  pageable?: PageableObjectDto;
  empty?: boolean;
}

export type DealStatusHistoryResponseDto = DealStatusHistory[];
