import type { UserRole } from "@/business/auth";

export type AdminUserResponseDto = {
  id: string;
  email: string | null;
  phone: string;
  fullName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  isActive: boolean;
  blockedAt: string | null;
  blockedBy: string | null;
  blockedReason: string | null;
};

export type BlockUserRequestDto = {
  reason: string;
};

export type UpdateUserRoleRequestDto = {
  role: UserRole;
};
