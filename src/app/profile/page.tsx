"use client";

import { useProfileDashboard } from "@/business/profile";
import { ProfileDashboard } from "@/ux/features";

export default function ProfilePage() {
  const { dashboard, isLoading } = useProfileDashboard();

  return <ProfileDashboard dashboard={dashboard} isLoading={isLoading} />;
}
