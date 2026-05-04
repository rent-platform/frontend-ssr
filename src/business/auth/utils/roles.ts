import type { UserRole } from "../types";
import { ROUTE_PATHS } from "@/business/shared";

const ROLE_PRIORITY: Record<UserRole, number> = {
  user: 0,
  moderator: 1,
  admin: 2,
};

export function hasRequiredRole(
  currentRole: UserRole,
  requiredRole: UserRole,
): boolean {
  return ROLE_PRIORITY[currentRole] >= ROLE_PRIORITY[requiredRole];
}

export function getDefaultRouteForRole(role?: UserRole | null): string {
  if (role === "admin") return ROUTE_PATHS.ADMIN;
  if (role === "moderator") return ROUTE_PATHS.MODERATOR;
  return ROUTE_PATHS.HOME;
}




