"use client";

import { useSession } from "@/business/auth";
import { adsApi } from "@/business/ads";
import { store } from "@/business/shared";
import { useEffect } from "react";

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
