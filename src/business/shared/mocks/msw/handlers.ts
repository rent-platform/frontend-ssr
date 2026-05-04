import { MOCK_CATALOG_ITEMS } from "@/business/ads";
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
  http.get(`${API}/proxy/api/catalog/items`, async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 0);
    const size = Number(url.searchParams.get("size") ?? 20);
    const search = url.searchParams.get("query") ?? "";

    const filtered = MOCK_CATALOG_ITEMS.filter((item) =>
      search ? item.title.toLowerCase().includes(search.toLowerCase()) : true,
    );

    const startIndex = page * size;
    const content = filtered.slice(startIndex, startIndex + size);
    const totalPages = Math.ceil(filtered.length / size);

    return HttpResponse.json({
      totalElements: filtered.length,
      totalPages,
      first: page === 0,
      last: page >= totalPages - 1,
      size,
      content,
      number: page,
      numberOfElements: content.length,
      empty: content.length === 0,
    });
  }),

  http.get(`${API}/proxy/api/catalog/items/:id`, async ({ params }) => {
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

  http.get(`${API}/proxy/api/catalog/items/:id/availability`, async ({ request }) => {
    await delay(200);

    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    if (!startDate || !endDate) {
      return HttpResponse.json(
        { success: false, error: "startDate and endDate are required" },
        { status: 400 },
      );
    }

    const slots: Array<{ availableDate: string; isAvailable: boolean }> = [];
    const cursor = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    while (cursor <= end) {
      const availableDate = cursor.toISOString().slice(0, 10);
      const day = cursor.getDay();
      slots.push({
        availableDate,
        isAvailable: day !== 0 && day !== 6,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return HttpResponse.json(slots);
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// DEALS
// ─────────────────────────────────────────────────────────────────────────────
const dealHandlers = [
  http.get(`${API}/proxy/api/deals/my/renter`, async () => {
    await delay(300);
    return HttpResponse.json({
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      size: 20,
      content: [],
      number: 0,
      numberOfElements: 0,
      empty: true,
    });
  }),

  http.get(`${API}/proxy/api/deals/my/owner`, async () => {
    await delay(300);
    return HttpResponse.json({
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      size: 20,
      content: [],
      number: 0,
      numberOfElements: 0,
      empty: true,
    });
  }),

  http.post(`${API}/proxy/api/deals`, async () => {
    await delay(300);
    return HttpResponse.json(
      { success: false, error: "Mock deal creation is not configured" },
      { status: 501 },
    );
  }),

  http.get(`${API}/proxy/api/deals/:id`, async ({ params }) => {
    await delay(200);
    return HttpResponse.json(
      { success: false, error: `Deal ${String(params.id)} not found` },
      { status: 404 },
    );
  }),

  http.post(`${API}/proxy/api/deals/:id/confirm`, async () => {
    await delay(200);
    return HttpResponse.json(
      { success: false, error: "Mock deal confirmation is not configured" },
      { status: 501 },
    );
  }),

  http.post(`${API}/proxy/api/deals/:id/reject`, async () => {
    await delay(200);
    return HttpResponse.json(
      { success: false, error: "Mock deal rejection is not configured" },
      { status: 501 },
    );
  }),

  http.post(`${API}/proxy/api/deals/:id/cancel`, async () => {
    await delay(200);
    return HttpResponse.json(
      { success: false, error: "Mock deal cancellation is not configured" },
      { status: 501 },
    );
  }),

  http.post(`${API}/proxy/api/deals/:id/start`, async () => {
    await delay(200);
    return HttpResponse.json(
      { success: false, error: "Mock deal start is not configured" },
      { status: 501 },
    );
  }),

  http.post(`${API}/proxy/api/deals/:id/complete`, async () => {
    await delay(200);
    return HttpResponse.json(
      { success: false, error: "Mock deal completion is not configured" },
      { status: 501 },
    );
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





