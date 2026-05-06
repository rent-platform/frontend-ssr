import { getApiErrorMessage } from "@/business/shared/utils";
import type { AuthResponseDTO, RegisterRequestDTO, UserResponseDTO } from "../types";

type FetchApiParams = {
  endpoint: string;
  options?: RequestInit;
  accessToken?: string;
};

function getBackendBaseUrl(): string {
  const backendUrl =
    process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!backendUrl) {
    throw new Error("Backend API URL is not configured");
  }

  return backendUrl.replace(/\/+$/, "");
}

export async function fetchApi<T = unknown>({
  endpoint,
  options,
  accessToken,
}: FetchApiParams): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${getBackendBaseUrl()}${endpoint}`, {
    method: "POST",
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(getApiErrorMessage({ status: res.status, data }));
  }

  return data as T;
}

export function loginApi(payload: {
  login: string;
  password: string;
  rememberMe?: boolean;
}) {
  return fetchApi<AuthResponseDTO>({
    endpoint: "/api/auth/login",
    options: {
      method: "POST",
      body: JSON.stringify(payload),
    },
  });
}

export function refreshApi(refreshToken: string) {
  return fetchApi<AuthResponseDTO>({
    endpoint: "/api/auth/refresh",
    options: {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    },
  });
}

export function getMeApi(accessToken: string) {
  return fetchApi<UserResponseDTO>({
    endpoint: "/api/users/me",
    options: {
      method: "GET",
    },
    accessToken,
  });
}

export function registerApi(payload: RegisterRequestDTO) {
  return fetchApi<UserResponseDTO>({
    endpoint: "/api/auth/register",
    options: {
      method: "POST",
      body: JSON.stringify(payload),
    },
  });
}
