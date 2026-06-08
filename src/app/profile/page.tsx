"use client";

import { useProfile } from "@/business/profile";
import { ProfileDashboard } from "@/ux/features";
import type { ProfileUser } from "@/ux/features/Profile/types";

function mapProfileUser(profile: NonNullable<ReturnType<typeof useProfile>["profile"]>): ProfileUser {
  return {
    id: profile.id,
    fullName: profile.fullName || profile.nickname || "Пользователь",
    nickname: profile.nickname,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    phone: profile.phone,
    email: profile.email,
    rating: 0,
    reviewCount: 0,
    memberSince: new Date().toISOString(),
  };
}

export default function ProfilePage() {
  const { profile, isLoading } = useProfile();

  return (
    <ProfileDashboard
      user={profile ? mapProfileUser(profile) : undefined}
      isLoading={isLoading}
    />
  );
}
