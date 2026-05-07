import type { UserRole } from "@/business/auth";

export type ProfileResponseDto = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  isActive?: boolean;
  blockedAt?: string | null;
  blockedBy?: string | null;
  blockedReason?: string | null;
};

export type ProfileUpdateDto = {
  fullName?: string;
  email?: string;
  nickname?: string;
  bio?: string;
  avatarUrl?: string;
};

export type PublicProfileResponseDto = {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  overallRating: number | null;
};

export type UpdatePasswordRequestDto = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type BillingProfileResponseDto = {
  id: string;
  userId: string;
  customerId: string | null;
  defaultPaymentMethodId: string | null;
};

export type BillingProfileRequestDto = {
  customerId?: string;
  paymentMethodId?: string;
};
