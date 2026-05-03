import { decodeJwt } from "jose";
import { encode, getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Route Handler работает на Node.js runtime, потому что здесь используется
// серверная работа с Auth.js JWT cookie и запросы к внешнему Java backend.
export const runtime = "nodejs";
// Proxy route не должен кэшироваться: каждый запрос зависит от cookie пользователя.
export const dynamic = "force-dynamic";

// Максимальный срок жизни Auth.js session cookie.
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
// Буфер для proactive refresh: токен обновляется за 5 минут до истечения.
const ACCESS_TOKEN_REFRESH_BUFFER_SECONDS = 5 * 60;
// Имя cookie должно совпадать с настройкой cookies.sessionToken в Auth.js config.
const AUTH_COOKIE_NAME = "ilyha-next-auth.session-token";
// Секрет нужен для чтения и повторного кодирования Auth.js JWT cookie.
const AUTH_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
// Адрес внешнего Java backend задается через server env.
// NEXT_PUBLIC_API_URL оставлен как fallback для текущей конфигурации проекта.
const BACKEND_API_URL =
  process.env.JAVA_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL;

// Ответ Java backend при обновлении accessToken.
type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
};

type TokenWithAccessToken = JWT & {
  accessToken: string;
};

// В Next.js 16 params в Route Handler передаются как Promise.
type ProxyRouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

// Формирует Set-Cookie для обновленной Auth.js JWT session cookie.
// Cookie остается HttpOnly, поэтому клиентский JavaScript ее не читает.
function createSessionCookie(value: string): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_MAX_AGE}`,
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

// Формирует Set-Cookie для удаления невалидной session cookie.
// Используется, когда refreshToken больше не позволяет обновить accessToken.
function clearSessionCookie(): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

// Извлекает exp из backend accessToken.
// Если токен не удалось декодировать, старое значение exp будет сохранено.
function getTokenExpiresAt(accessToken: string): number | undefined {
  try {
    return decodeJwt(accessToken).exp;
  } catch {
    return undefined;
  }
}

// Определяет необходимость обновления accessToken до обращения к backend.
// Эта проверка нужна именно здесь, потому что getToken() не запускает
// Auth.js jwt/session callbacks автоматически.
function shouldRefreshAccessToken(token: JWT): boolean {
  if (typeof token.exp !== "number") return false;

  const now = Math.floor(Date.now() / 1000);
  // accessToken обновляется заранее, если до истечения осталось меньше 5 минут.
  return now >= token.exp - ACCESS_TOKEN_REFRESH_BUFFER_SECONDS;
}

// Обновляет accessToken на сервере и пересобирает Auth.js JWT cookie.
// Клиент получает только Set-Cookie, но не получает сам токен в JavaScript.
async function refreshAuthToken(
  token: JWT,
  backendBaseUrl: string,
): Promise<{ token: TokenWithAccessToken; sessionCookie: string } | null> {
  // refreshToken хранится в серверной части Auth.js JWT.
  // Если его нет, обновить accessToken невозможно.
  const refreshToken = token.refreshToken;

  if (typeof refreshToken !== "string" || !refreshToken) {
    return null;
  }

  try {
    // Запрос refresh выполняется с сервера напрямую на Java backend.
    // Клиент не участвует в этом запросе и не получает refreshToken.
    const refreshResponse = await fetch(`${backendBaseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshResponse.ok) {
      return null;
    }

    const refreshed = (await refreshResponse.json()) as RefreshResponse;

    if (!refreshed.accessToken) {
      return null;
    }

    // Формируется новый JWT payload: accessToken заменяется и при необходимости
    // обновляется refreshToken. Остальные пользовательские поля остаются без изменений.
    const nextToken: TokenWithAccessToken = {
      ...token,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken ?? refreshToken,
      exp: getTokenExpiresAt(refreshed.accessToken) ?? token.exp,
    };

    // JWT повторно кодируется так же, как это делает Auth.js для session cookie.
    const encodedSession = await encode({
      token: nextToken,
      secret: AUTH_SECRET!,
      salt: AUTH_COOKIE_NAME,
      maxAge: SESSION_MAX_AGE,
    });

    return {
      token: nextToken,
      sessionCookie: createSessionCookie(encodedSession),
    };
  } catch {
    return null;
  }
}

async function proxyToBackend(
  request: NextRequest,
  context: ProxyRouteContext,
): Promise<Response> {
  // Без адреса backend невозможно построить целевой URL.
  if (!BACKEND_API_URL) {
    return Response.json(
      { error: "Backend API URL is not configured" },
      { status: 500 },
    );
  }

  // Без AUTH_SECRET нельзя безопасно прочитать или обновить Auth.js JWT.
  if (!AUTH_SECRET) {
    return Response.json(
      { error: "Auth secret is not configured" },
      { status: 500 },
    );
  }

  // accessToken хранится внутри Auth.js JWT cookie.
  // getToken() читает cookie на сервере и не раскрывает токен клиентскому JS.
  let token = await getToken({
    req: request,
    secret: AUTH_SECRET,
    cookieName: AUTH_COOKIE_NAME,
  });

  // Если пользователь не авторизован или cookie не содержит accessToken,
  // proxy не отправляет запрос во внешний backend.
  if (!token || typeof token.accessToken !== "string" || !token.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = token.accessToken;

  const { path = [] } = await context.params;
  const backendBaseUrl = BACKEND_API_URL.replace(/\/+$/, "");
  // Каждый сегмент пути кодируется отдельно, чтобы сохранить структуру URL.
  const backendPath = path.map(encodeURIComponent).join("/");
  // Catch-all path /api/proxy/ads/123 превращается в {backend}/ads/123.
  const targetUrl = new URL(`${backendBaseUrl}/${backendPath}`);
  // Query params клиента передаются в backend без изменения.
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  // Клиентские служебные заголовки удаляются.
  // Authorization будет сформирован заново на серверной стороне.
  headers.delete("host");
  headers.delete("cookie");
  headers.delete("authorization");

  // Тело запроса считывается один раз из входящего Request и сохраняется,
  // чтобы обеспечить возможность повторного выполнения запроса
  const hasRequestBody = request.method !== "GET" && request.method !== "HEAD";
  const requestBody = hasRequestBody ? await request.arrayBuffer() : undefined;
  // Authorization header добавляется к backend-запросу.
  const fetchBackend = (bearerToken: string) => {
    const backendHeaders = new Headers(headers);
    backendHeaders.set("Authorization", `Bearer ${bearerToken}`);
    return fetch(targetUrl, {
      method: request.method,
      headers: backendHeaders,
      body: requestBody,
      redirect: "manual",
    });
  };

  let nextSessionCookie: string | null = null;
  let shouldClearSessionCookie = false;
  let backendAccessToken = accessToken;

  // Proactive refresh: если accessToken скоро истечет, токен обновляется
  // до первого обращения к Java backend.
  if (shouldRefreshAccessToken(token)) {
    const refreshed = await refreshAuthToken(token, backendBaseUrl);

    if (refreshed) {
      token = refreshed.token;
      backendAccessToken = refreshed.token.accessToken;
      nextSessionCookie = refreshed.sessionCookie;
    }
  }

  // Первый запрос к backend выполняется с текущим или заранее обновленным токеном.
  let backendResponse = await fetchBackend(backendAccessToken);

  // Reactive refresh: если backend вернул 401, токен обновляется,
  // после чего исходный запрос повторяется один раз с новым accessToken.
  if (backendResponse.status === 401) {
    const refreshed = await refreshAuthToken(token, backendBaseUrl);

    if (refreshed) {
      token = refreshed.token;
      nextSessionCookie = refreshed.sessionCookie;
      backendResponse = await fetchBackend(refreshed.token.accessToken);
    } else {
      shouldClearSessionCookie = true;
    }
  }

  // Ответ backend передается клиенту без преобразования тела.
  const response = new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: backendResponse.headers,
  });

  // После успешного refresh браузер получает новую HttpOnly cookie.
  if (nextSessionCookie) {
    response.headers.append("Set-Cookie", nextSessionCookie);
  }

  // Если refresh невозможен, сессия очищается, чтобы в браузере не оставалась
  // невалидная Auth.js cookie.
  if (shouldClearSessionCookie) {
    response.headers.append("Set-Cookie", clearSessionCookie());
  }

  return response;
}

export const GET = proxyToBackend;
export const POST = proxyToBackend;
export const PUT = proxyToBackend;
export const PATCH = proxyToBackend;
export const DELETE = proxyToBackend;
export const HEAD = proxyToBackend;
export const OPTIONS = proxyToBackend;
