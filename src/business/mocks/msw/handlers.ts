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
  http.get(`${API}/ads`, async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor"); // ← cursor, не page
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);
    const search = url.searchParams.get("search") ?? "";

    const filtered = MOCK_CATALOG_ITEMS.filter((item) =>
      search ? item.title.toLowerCase().includes(search.toLowerCase()) : true,
    );

    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const items = filtered.slice(startIndex, startIndex + pageSize);
    const nextIndex = startIndex + pageSize;
    const nextCursor =
      nextIndex < filtered.length ? String(nextIndex) : undefined;

    return HttpResponse.json({
      items,
      meta: {
        page: Math.floor(startIndex / pageSize) + 1,
        pageSize,
        totalCount: filtered.length,
        pagesCount: Math.ceil(filtered.length / pageSize),
        nextCursor,
      },
    });
  }),

  ,
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
