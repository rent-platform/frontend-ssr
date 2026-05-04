/**
 * Formats a numeric string as a Russian-locale price with suffix.
 * `formatPrice('1500', '/сутки')` → '1 500 ₽/сутки'
 */
export function formatPrice(value: string | null, suffix = ''): string {
  if (!value) return 'По запросу';
  return `${new Intl.NumberFormat('ru-RU').format(Number(value))} ₽${suffix}`;
}

/**
 * Extracts numeric price from string (strips spaces, replaces comma with dot).
 */
export function getNumericPrice(value: string | null): number {
  if (!value) return 0;
  return Number(value.replace(/[\s,]/g, '.').replace(/\.+/g, '.'));
}

/**
 * Formats a relative time string from an ISO date.
 * e.g. '2 ч назад', '3 дн назад'
 */
export function timeAgo(iso: string): string {
  const now = Date.now();
  const d = new Date(iso).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  const days = Math.round(diff / 86400);
  return `${days} дн назад`;
}

/**
 * Formats time as HH:MM from ISO string.
 */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formats a date range: '5 янв — 10 янв'
 */
export function formatDateRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const s = new Date(start).toLocaleDateString('ru-RU', opts);
  const e = new Date(end).toLocaleDateString('ru-RU', opts);
  return `${s} — ${e}`;
}

/**
 * Extracts initials from a full name: 'Иван Петров' → 'ИП'
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
}
