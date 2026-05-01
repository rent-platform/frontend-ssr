import { decodeJwt } from "jose";
import { encode, getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;
const ACCESS_TOKEN_REFRESH_BUFFER_SECONDS = 5 * 60;
const AUTH_COOKIE_NAME = "ilyha-next-auth.session-token";
const AUTH_SECRET = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const BACKEND_API_URL =
  process.env.JAVA_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL;

type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
};

type TokenWithAccessToken = JWT & {
  accessToken: string;
};

type ProxyRouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

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

function getTokenExpiresAt(accessToken: string): number | undefined {
  try {
    return decodeJwt(accessToken).exp;
  } catch {
    return undefined;
  }
}

function shouldRefreshAccessToken(token: JWT): boolean {
  if (typeof token.exp !== "number") return false;

  const now = Math.floor(Date.now() / 1000);
  return now >= token.exp - ACCESS_TOKEN_REFRESH_BUFFER_SECONDS;
}

async function refreshAuthToken(
  token: JWT,
  backendBaseUrl: string,
): Promise<{ token: TokenWithAccessToken; sessionCookie: string } | null> {
  const refreshToken = token.refreshToken;

  if (typeof refreshToken !== "string" || !refreshToken) {
    return null;
  }

  try {
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

    const nextToken: TokenWithAccessToken = {
      ...token,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken ?? refreshToken,
      exp: getTokenExpiresAt(refreshed.accessToken) ?? token.exp,
    };

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
  if (!BACKEND_API_URL) {
    return Response.json(
      { error: "Backend API URL is not configured" },
      { status: 500 },
    );
  }

  if (!AUTH_SECRET) {
    return Response.json(
      { error: "Auth secret is not configured" },
      { status: 500 },
    );
  }

  let token = await getToken({
    req: request,
    secret: AUTH_SECRET,
    cookieName: AUTH_COOKIE_NAME,
  });

  if (!token || typeof token.accessToken !== "string" || !token.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = token.accessToken;

  const { path = [] } = await context.params;
  const backendBaseUrl = BACKEND_API_URL.replace(/\/+$/, "");
  const backendPath = path.map(encodeURIComponent).join("/");
  const targetUrl = new URL(`${backendBaseUrl}/${backendPath}`);
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("cookie");
  headers.delete("authorization");

  const hasRequestBody = request.method !== "GET" && request.method !== "HEAD";
  const requestBody = hasRequestBody ? await request.arrayBuffer() : undefined;

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

  if (shouldRefreshAccessToken(token)) {
    const refreshed = await refreshAuthToken(token, backendBaseUrl);

    if (refreshed) {
      token = refreshed.token;
      backendAccessToken = refreshed.token.accessToken;
      nextSessionCookie = refreshed.sessionCookie;
    }
  }

  let backendResponse = await fetchBackend(backendAccessToken);

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

  const response = new Response(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: backendResponse.headers,
  });

  if (nextSessionCookie) {
    response.headers.append("Set-Cookie", nextSessionCookie);
  }

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
