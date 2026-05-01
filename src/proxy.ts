import { auth } from "@/config/auth";
import {
  getDefaultRouteForRole,
  hasRequiredRole,
} from "@/business/utils/auth/roles";
import ROUTE_PATHS from "@/business/utils/routes/routes";

const PUBLIC_ROUTES = [
  ROUTE_PATHS.HOME,
  ROUTE_PATHS.CATALOG,
  ROUTE_PATHS.FAVORITES,
  ROUTE_PATHS.LOGIN,
  ROUTE_PATHS.REGISTER,
];

function isRouteMatch(pathname: string, route: string): boolean {
  if (route === ROUTE_PATHS.HOME) {
    return pathname === route;
  }

  return pathname === route || pathname.startsWith(`${route}/`);
}

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  // req.auth is populated by Auth.js from the encrypted JWT session cookie.
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isApiAuthRoute = pathname.startsWith(ROUTE_PATHS.authorization);
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    isRouteMatch(pathname, route),
  );

  const isAuthRoute = [ROUTE_PATHS.LOGIN, ROUTE_PATHS.REGISTER].includes(
    pathname,
  );
  const isAdminRoute =
    pathname === ROUTE_PATHS.ADMIN ||
    pathname.startsWith(`${ROUTE_PATHS.ADMIN}/`);
  const isModeratorRoute =
    pathname === ROUTE_PATHS.MODERATOR ||
    pathname.startsWith(`${ROUTE_PATHS.MODERATOR}/`);

  if (isApiAuthRoute) return;

  // Auth pages stay public, but an authenticated user is sent to their role home.
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(getDefaultRouteForRole(role), nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL(ROUTE_PATHS.LOGIN, nextUrl));
  }

  // Role routes are checked here for fast navigation redirects.
  // Server components still repeat the check with requireRole().
  if (isAdminRoute && (!role || !hasRequiredRole(role, "admin"))) {
    return Response.redirect(new URL(getDefaultRouteForRole(role), nextUrl));
  }

  if (isModeratorRoute && (!role || !hasRequiredRole(role, "moderator"))) {
    return Response.redirect(new URL(getDefaultRouteForRole(role), nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
