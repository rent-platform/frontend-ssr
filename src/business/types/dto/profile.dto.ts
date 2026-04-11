import type { UserRole } from "@/business/types/entity/user.types";

export type ProfileResponseDto = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
};

export type ProfileUpdateDto = {
  full_name?: string;
  email?: string;
  nickname?: string;
  bio?: string;
};
