import { auth } from "@/config/auth";
import ROUTE_PATHS from "@/business/utils/routes/routes";

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(ROUTE_PATHS.authorization);
  const isPublicRoute = [
    // ROUTE_PATHS.HOME, // TODO: add
    ROUTE_PATHS.LOGIN,
    ROUTE_PATHS.REGISTER,
  ].includes(nextUrl.pathname);

  const isAuthRoute = [ROUTE_PATHS.LOGIN, ROUTE_PATHS.REGISTER].includes(
    nextUrl.pathname,
  );

  if (isApiAuthRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(ROUTE_PATHS.HOME, nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL(ROUTE_PATHS.LOGIN, nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
