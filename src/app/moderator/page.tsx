import Link from "next/link";
import { requireRole } from "@/business/utils/auth/serverAuth";
import ROUTE_PATHS from "@/business/utils/routes/routes";

export default async function ModeratorPage() {
  const session = await requireRole("moderator");

  return (
    <main style={{ padding: "32px" }}>
      <h1>Moderator dashboard</h1>
      <p>
        User: {session.user.full_name ?? session.user.phone}
      </p>
      <p>Role: {session.user.role}</p>
      <Link href={ROUTE_PATHS.HOME}>Home</Link>
    </main>
  );
}
