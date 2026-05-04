import type { UserRole } from "./user.types";
import type { DeepPartial } from "@/business/shared";

export type LoginRequestDTO = {
  tel: string;
  password: string;
};

export type RegisterRequestDTO = {
  name: string;
  tel: string;
  password: string;
};

export type UserResponseDTO = {
  id: string;
  email: string | null;
  phone: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  role: UserRole;
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
}>;

export type AuthResponseDTO = {
  accessToken: string;
  user: UserResponseDTO;
};



