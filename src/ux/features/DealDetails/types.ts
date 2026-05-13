import type { UiDealStatus } from '@/ux/types/deal';

export type DealViewMode = 'renter' | 'owner';

export interface DealStep {
  number: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface DealParticipantInfo {
  name: string;
  initial: string;
  role: 'renter' | 'owner';
  avatarColor: string;
}

export interface DealDetailsData {
  id: string;
  title: string;
  imageUrl: string;
  status: UiDealStatus;
  viewMode: DealViewMode;
  startDate: string;
  endDate: string;
  rentalPrice: number;
  deposit: number;
  city: string;
  pickupLocation: string;
  participant: DealParticipantInfo;
  rejectionReason?: string;
  cancellationReason?: string;
}

export interface DealDetailsPageProps {
  dealId: string;
}

export type DealStatusBadgeColor = 'green' | 'red';
