import { auth } from "@/config/auth";
import { getDefaultRouteForRole, hasRequiredRole } from "@/business/auth";
import { ROUTE_PATHS } from "@/business/shared";

const PUBLIC_ROUTES = [
  ROUTE_PATHS.HOME, // Главная страница
  ROUTE_PATHS.CATALOG, // Каталог и вложенные страницы каталога открыты без авторизации.
  ROUTE_PATHS.FAVORITES, // Раздел избранного.
  // Страницы входа и регистрации не требуют активной сессии.
  ROUTE_PATHS.LOGIN,
  ROUTE_PATHS.REGISTER,
];
// Проверяет совпадение текущего URL с публичным маршрутом.
// Для главной страницы разрешается только точное совпадение "/".
// Для разделов разрешаются и вложенные страницы: /catalog и /catalog/123.
function isRouteMatch(pathname: string, route: string): boolean {
  if (route === ROUTE_PATHS.HOME) {
    return pathname === route;
  }
  return pathname === route || pathname.startsWith(`${route}/`);
}

// proxy выполняется до рендера страницы и решает,
// можно ли пользователю открыть запрошенный frontend-маршрут.
export const proxy = auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  // req.auth заполняется Auth.js из зашифрованной JWT session cookie.
  const isLoggedIn = !!req.auth;
  // Роль хранится в session.user и используется для admin/moderator страниц.
  const role = req.auth?.user?.role;
  // Служебные Auth.js API routes не должны проходить frontend-защиту.
  const isApiAuthRoute = pathname.startsWith(ROUTE_PATHS.authorization);
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    isRouteMatch(pathname, route),
  );
  // Auth pages обрабатываются отдельно: для гостя они открыты,
  // а авторизованный пользователь перенаправляется на свою стартовую страницу.
  const isAuthRoute = [ROUTE_PATHS.LOGIN, ROUTE_PATHS.REGISTER].includes(
    pathname,
  );
  // Административный раздел требует роль admin.
  const isAdminRoute =
    pathname === ROUTE_PATHS.ADMIN ||
    pathname.startsWith(`${ROUTE_PATHS.ADMIN}/`);
  // Модераторский раздел доступен moderator и admin.
  const isModeratorRoute =
    pathname === ROUTE_PATHS.MODERATOR ||
    pathname.startsWith(`${ROUTE_PATHS.MODERATOR}/`);

  // Маршруты /api/auth/* исключаются из frontend-защиты,
  // чтобы Auth.js мог выполнить sign in/out.
  if (isApiAuthRoute) return;

  // Страницы входа и регистрации не показываются пользователю,
  // если он уже вошел в систему.
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(getDefaultRouteForRole(role), nextUrl));
    }
    return;
  }

  // Все маршруты, которые не входят в PUBLIC_ROUTES, требуют авторизации.
  // Если сессии нет, пользователь перенаправляется на страницу входа.
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL(ROUTE_PATHS.LOGIN, nextUrl));
  }

  // Проверка роли в proxy дает быстрый редирект еще до загрузки страницы.
  // На самих server pages проверка дополнительно повторяется через requireRole().
  if (isAdminRoute && (!role || !hasRequiredRole(role, "admin"))) {
    return Response.redirect(new URL(getDefaultRouteForRole(role), nextUrl));
  }

  // Роль admin проходит проверку moderator,
  // так как hasRequiredRole() учитывает иерархию ролей.
  if (isModeratorRoute && (!role || !hasRequiredRole(role, "moderator"))) {
    return Response.redirect(new URL(getDefaultRouteForRole(role), nextUrl));
  }

  return;
});

export const config = {
  // proxy применяется к frontend-страницам.
  // /api/* исключен, потому что backend-запросы проходят через app/api/proxy.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
