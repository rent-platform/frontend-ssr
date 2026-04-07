import { http, HttpResponse, delay } from "msw";

// TODO: заменить на реальный URL
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

interface ApiError {
  success: false;
  error: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

const authHandlers = [
  http.post(`${API}/auth/refresh`, async () => {
    await delay(200);
    return HttpResponse.json({
      accessToken: `mock-access.refreshed.${Date.now()}`,
      expiresIn: 900,
    });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// CATALOG
// ─────────────────────────────────────────────────────────────────────────────
const catalogHandlers = [
  http.get(`${API}/catalog`, async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 10);

    const items = Array.from({ length: limit }, (_, i) => ({
      id: `item-${(page - 1) * limit + i + 1}`,
      title: `Объявление #${(page - 1) * limit + i + 1}`,
      price_per_day: Math.floor(Math.random() * 5000) + 500,
      status: "active",
      created_at: new Date().toISOString(),
    }));

    return HttpResponse.json({ items, total: 100, page, limit });
  }),

  http.get(`${API}/catalog/:id`, async ({ params }) => {
    await delay(200);
    const { id } = params;

    if (id === "not-found") {
      return HttpResponse.json<ApiError>(
        { success: false, error: "Объявление не найдено" },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      id,
      title: `Объявление ${id}`,
      description: "Мок-описание объявления",
      price_per_day: 1500,
      status: "active",
      owner_id: "mock-user-1",
      created_at: new Date().toISOString(),
    });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// DEALS
// ─────────────────────────────────────────────────────────────────────────────
const dealHandlers = [
  http.get(`${API}/deals`, async () => {
    await delay(300);
    return HttpResponse.json({ items: [], total: 0 });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
const notifHandlers = [
  http.get(`${API}/notifications`, async () => {
    await delay(200);
    return HttpResponse.json({ items: [], unread: 0 });
  }),
];

export const handlers = [
  ...authHandlers,
  ...catalogHandlers,
  ...dealHandlers,
  ...notifHandlers,
];
