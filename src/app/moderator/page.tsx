import { requireRole } from "@/business/auth/utils/serverAuth";
import { StaffDashboard } from "@/ux/features";

export default async function ModeratorPage() {
  const session = await requireRole("moderator");

  return (
    <StaffDashboard
      mode="moderator"
      role={session.user.role}
      userLabel={session.user.full_name ?? session.user.phone ?? session.user.id}
    />
  );
}

