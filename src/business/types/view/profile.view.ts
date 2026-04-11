import type { UserRole } from "@/business/types/entity/user.types";

export type ProfileVM = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
};
