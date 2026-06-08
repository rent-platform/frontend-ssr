import { requireRole } from "@/business/auth/utils/serverAuth";
import { StaffDashboard } from "@/ux/features";
import { ChatRealtimeTraceButton } from "./ChatRealtimeTraceButton";

export default async function AdminPage() {
  const session = await requireRole("admin");

  return (
    <div>
      <ChatRealtimeTraceButton />
      <StaffDashboard
        mode="admin"
        role={session.user.role}
        userLabel={
          session.user.full_name ?? session.user.phone ?? session.user.id
        }
      />
    </div>
  );
}
