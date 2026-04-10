import { MOCK_CATALOG_ITEMS } from "@/business/mocks/catalog/mockCatalog";
import { http, HttpResponse, delay } from "msw";

const API = "http://localhost:3000/api";

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

    const start = (page - 1) * limit;
    const items = MOCK_CATALOG_ITEMS.slice(start, start + limit);

    return HttpResponse.json({
      items,
      total: MOCK_CATALOG_ITEMS.length,
      page,
      limit,
    });
  }),

  http.get(`${API}/catalog/:id`, async ({ params }) => {
    await delay(200);
    const { id } = params;
    const item = MOCK_CATALOG_ITEMS.find((i) => i.id === id);

    if (!item) {
      return HttpResponse.json(
        { success: false, error: "Объявление не найдено" },
        { status: 404 },
      );
    }
    return HttpResponse.json(item);
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
