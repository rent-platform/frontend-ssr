import type { UserRole } from "./user.types";
import type { DeepPartial } from "@/business/shared";

export type LoginRequestDTO = {
  login: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterRequestDTO = {
  phone: string;
  password: string;
  confirmPassword: string;
  nickname: string;
};

export type UserResponseDTO = {
  id: string;
  email: string | null;
  phone: string;
  fullName: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole | string;
  isActive: boolean;
  blockedAt?: string | null;
  blockedBy?: string | null;
  blockedReason?: string | null;
};

export type UserUpdateDto = DeepPartial<{
  id: string;
  email: string | null;
  phone: string;
  password_hash: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  is_active: boolean;
  last_login_at: string | null;
  blocked_at: string | null;
  blocked_by: string | null;
  blocked_reason: string | null;
}>;

export type AuthResponseDTO = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
};

export type LogoutRequestDTO = {
  refreshToken: string;
};
