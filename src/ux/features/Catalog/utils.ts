export const currencyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export const compactFormatter = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatMoney(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return currencyFormatter.format(parsed);
}

export function formatViews(value: number) {
  return compactFormatter.format(value);
}

export function getDaysAgoLabel(dateISO: string) {
  const diff = Date.now() - new Date(dateISO).getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

  if (days === 0) return "Сегодня";
  if (days === 1) return "Вчера";
  if (days < 5) return `${days} дня назад`;
  if (days < 21) return `${days} дней назад`;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
  }).format(new Date(dateISO));
}

export function formatAvailability(dateISO: string) {
  const date = new Date(dateISO);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function getNumericPrice(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}
