import type { UserUpdate } from "@/business/types/entity";

interface FetchApiParams {
  endpoint: string;
  options?: RequestInit;
}

const JAVA_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
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
    const errorData = await res.json().catch(() => ({})); //чтобы кэч не упал от парсинга json
    const message = errorData.message || `Ошибка сервера (${res.status})`;
    throw new Error(message);
  }
  return await res.json();
}
