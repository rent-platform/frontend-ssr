import type { UserUpdate } from "@/business/types/entity";

interface FetchApiParams {
  endpoint: string;
  options?: RequestInit;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";


export async function fetchApi<T = UserUpdate>({
  endpoint,
  options,
}: FetchApiParams): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}