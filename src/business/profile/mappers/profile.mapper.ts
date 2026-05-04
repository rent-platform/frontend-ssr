import type { ProfileResponseDto, ProfileVM } from "../types";

export function mapProfileToVM(dto: ProfileResponseDto): ProfileVM {
  return {
    id: dto.id,
    fullName: dto.full_name,
    phone: dto.phone,
    email: dto.email,
    nickname: dto.nickname,
    avatarUrl: dto.avatar_url,
    bio: dto.bio,
    role: dto.role,
  };
}
// временная тема
export function mapSessionUserToProfileVM(user: {
  id: string;
  phone: string;
  role: string;
  full_name?: string | null;
  nickname?: string | null;
  avatar_url?: string | null;
  email?: string | null;
}): ProfileVM {
  return {
    id: user.id,
    fullName: user.full_name ?? "",
    phone: user.phone,
    email: user.email ?? null,
    nickname: user.nickname ?? null,
    avatarUrl: user.avatar_url ?? null,
    bio: null,
    role: user.role as ProfileVM["role"], // пока так
  };
}



