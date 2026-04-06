"use client";
import { redirect } from "next/navigation";
import ROUTE_PATHS from "@/business/utils/routes/routes";

export default function DevPage() {
  redirect(ROUTE_PATHS.LOGIN);
}
