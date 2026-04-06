"use client";
import { redirect } from "next/navigation";
import ROUTE_PATHS from "@/business/utils/routes/routes";

import { useSession } from "@/business/hooks";

export default function HomePage() {
  const { user } = useSession();

  return (
    <>
      <div>home</div>
      <div>{user?.full_name}</div>
      <div>{user?.email}</div>
      <div>{user?.name}</div>
    </>
  );
}
