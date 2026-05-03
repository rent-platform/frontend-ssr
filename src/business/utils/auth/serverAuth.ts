import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import type { UserRole } from "@/business/types";
import {
  getDefaultRouteForRole,
  hasRequiredRole,
} from "@/business/utils/auth/roles";
import ROUTE_PATHS from "../routes/routes";
import { auth } from "@/config/auth";

export const getAuthSession = cache(async () => auth());

export async function requireSession(): Promise<Session> {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(ROUTE_PATHS.LOGIN);
  }

  return session;
}

export async function requireRole(requiredRole: UserRole): Promise<Session> {
  const session = await requireSession();
  const currentRole = session.user.role;

  if (!currentRole || !hasRequiredRole(currentRole, requiredRole)) {
    redirect(getDefaultRouteForRole(currentRole));
  }

  return session;
}
