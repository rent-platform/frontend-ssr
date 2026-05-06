import Link from "next/link";
import { requireRole } from "@/business/auth/utils/serverAuth";
import { ROUTE_PATHS } from "@/business/shared/utils";

export default async function AdminPage() {
  const session = await requireRole("admin");

  return (
    <main style={{ padding: "32px" }}>
      <h1>Admin dashboard</h1>
      <p>User: {session.user.full_name ?? session.user.phone}</p>
      <p>Role: {session.user.role}</p>
      <Link href={ROUTE_PATHS.HOME}>Home</Link>
    </main>
  );
}

