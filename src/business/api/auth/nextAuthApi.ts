import { getApiErrorMessage } from "@/business/utils";

interface FetchApiParams {
  endpoint: string;
  options?: RequestInit;
}

const BASE_URL = process.env.NEXTAUTH_URL ?? "localhost:3000";

export async function fetchApi<T = unknown>({
  endpoint,
  options,
}: FetchApiParams): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      getApiErrorMessage({ status: res.status, data: errorData }),
    );
  }

  return await res.json();
}
