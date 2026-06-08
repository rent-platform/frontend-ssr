import type {
  ProfileDashboardStatsVM,
  ProfileDashboardUserVM,
  ProfileDashboardVM,
  ProfileResponseDto,
  ProfileVM,
} from "../types";
import type { UserRatingSummaryDTO } from "@/business/reviews";

export function mapProfileToVM(dto: ProfileResponseDto): ProfileVM {
  return {
    id: dto.id,
    fullName: dto.fullName,
    phone: dto.phone,
    email: dto.email,
    nickname: dto.nickname,
    avatarUrl: dto.avatarUrl,
    bio: dto.bio,
    role: dto.role,
  };
}

// временная тема
export function mapSessionUserToProfileVM(user: {
  id: string;
  phone: string;
  role: string;
  fullName?: string | null;
  nickname?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
}): ProfileVM {
  return {
    id: user.id,
    fullName: user.fullName ?? "",
    phone: user.phone,
    email: user.email ?? null,
    nickname: user.nickname ?? null,
    avatarUrl: user.avatarUrl ?? null,
    bio: null,
    role: user.role as ProfileVM["role"], // пока так
  };
}

export function mapProfileToDashboardUserVM(
  profile: ProfileVM,
  ratingSummary?: UserRatingSummaryDTO | null,
): ProfileDashboardUserVM {
  return {
    ...profile,
    rating: ratingSummary?.overallRating ?? 0,
    reviewCount: ratingSummary?.totalReviews ?? 0,
    memberSince: null,
  };
}

export function mapProfileDashboardVM(
  profile: ProfileVM,
  stats: ProfileDashboardStatsVM,
  ratingSummary?: UserRatingSummaryDTO | null,
): ProfileDashboardVM {
  return {
    user: mapProfileToDashboardUserVM(profile, ratingSummary),
    stats,
  };
}
