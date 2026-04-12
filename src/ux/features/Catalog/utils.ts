import type { CatalogFilterState, CatalogSortKey, CatalogUiItem } from './types';

export const CATEGORY_OPTIONS = [
  'Все категории',
  'Электроника',
  'Фото и видео',
  'Инструменты',
  'Для дома',
  'Спорт и отдых',
  'Детские товары',
  'Мероприятия',
] as const;

export const CITY_OPTIONS = [
  'Все города',
  'Новосибирск',
  'Бердск',
  'Академгородок',
  'Кольцово',
] as const;

export const QUICK_FILTER_OPTIONS = [
  'С доставкой',
  'Рядом сегодня',
  'Без залога',
  'Топ-рейтинг',
  'Новинки',
] as const;

export const INITIAL_FILTERS: CatalogFilterState = {
  search: '',
  city: 'Новосибирск',
  category: 'Все категории',
  minPrice: '',
  maxPrice: '',
  onlyAvailable: true,
  sortBy: 'popular',
  quickFilter: null,
  condition: [],
  ownerType: 'all',
  deliveryType: 'all',
  hasDeposit: 'all',
};

export const getNumericPrice = (value: string | null) => {
  if (!value) return 0;
  return Number(value.replace(/\s/g, '').replace(',', '.'));
};

export const formatPrice = (value: string | null, suffix: string) => {
  if (!value) return 'По запросу';

  return `${new Intl.NumberFormat('ru-RU').format(Number(value))} ₽${suffix}`;
};

const normalizeNumberish = (value: string | null) => {
  if (!value) return null;
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const formatDepositAmount = (value: string | null) => {
  const amount = normalizeNumberish(value);
  if (amount === null) return 'по запросу';
  return `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`;
};

export const getAnnouncementsLabel = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return 'объявление';
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'объявления';
  }

  return 'объявлений';
};

export const getPrimaryPrice = (
  item: CatalogUiItem,
  pricingMode: CatalogFilterState['pricingMode'],
) => {
  if (pricingMode === 'hour' && item.price_per_hour) {
    return formatPrice(item.price_per_hour, '/час');
  }

  return formatPrice(item.price_per_day, '/сутки');
};

export const getSecondaryPrice = (item: CatalogUiItem) => {
  if (item.price_per_hour && item.price_per_day) {
    return `${formatPrice(item.price_per_hour, '/час')} · ${formatPrice(
      item.price_per_day,
      '/сутки',
    )}`;
  }

  return item.price_per_hour
    ? formatPrice(item.price_per_hour, '/час')
    : formatPrice(item.price_per_day, '/сутки');
};

/** Карточка каталога: основная строка — только сутки. */
export const formatCatalogCardPrimaryPrice = (item: CatalogUiItem) =>
  formatPrice(item.price_per_day, '/сутки');

/** Вторая строка под ценой: только ₽/час, если заданы и сутки, и час. */
export const formatCatalogCardHourSecondary = (item: CatalogUiItem): string | null =>
  item.price_per_day && item.price_per_hour
    ? formatPrice(item.price_per_hour, '/час')
    : null;

/** Город и адрес/район без дублирования города в строке выдачи. */
export const formatCatalogCardLocation = (item: CatalogUiItem): string => {
  const city = item.city?.trim() ?? '';
  const detail = (item.pickup_location ?? item.location ?? '').trim();
  if (!detail) {
    return city || 'Адрес не указан';
  }
  if (!city) {
    return detail;
  }
  if (detail === city || detail.startsWith(`${city},`) || detail.startsWith(`${city} `)) {
    return detail;
  }
  return `${city}, ${detail}`;
};

export const formatViews = (count: number) =>
  `${new Intl.NumberFormat('ru-RU').format(count)} просмотров`;

export const formatRelativeDate = (isoDate: string) => {
  const diffHours = Math.max(
    1,
    Math.round((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60)),
  );

  if (diffHours < 24) {
    return `${diffHours} ч назад`;
  }

  const days = Math.round(diffHours / 24);

  return `${days} дн назад`;
};

const priceToNumber = (value: string | null) => (value ? Number(value) : Infinity);

export const sortCatalogItems = (items: CatalogUiItem[], sortBy: CatalogSortKey) => {
  const sorted = [...items];

  switch (sortBy) {
    case 'priceAsc':
      return sorted.sort((a, b) => priceToNumber(a.price_per_day) - priceToNumber(b.price_per_day));
    case 'priceDesc':
      return sorted.sort((a, b) => priceToNumber(b.price_per_day) - priceToNumber(a.price_per_day));
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case 'popular':
    default:
      return sorted.sort((a, b) => b.views_count - a.views_count);
  }
};

export const applyCatalogFilters = (
  items: CatalogUiItem[],
  filters: CatalogFilterState,
) => {
  const query = filters.search.trim().toLowerCase();
  const minPrice = filters.minPrice ? Number(filters.minPrice) : 0;
  const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : Infinity;

  return sortCatalogItems(
    items.filter((item) => {
      const primaryPrice = Number(item.price_per_day ?? 0);

      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.item_description?.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query));

      const matchesCategory =
        filters.category === 'Все категории' || item.category === filters.category;

      const matchesCity =
        filters.city === 'Все города' || item.city === filters.city;

      const matchesAvailability = !filters.onlyAvailable || item.isAvailable;

      const matchesPrice = primaryPrice >= minPrice && primaryPrice <= maxPrice;

      const matchesQuickFilter =
        !filters.quickFilter || item.quickFilters.includes(filters.quickFilter);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesCity &&
        matchesAvailability &&
        matchesPrice &&
        matchesQuickFilter
      );
    }),
    filters.sortBy,
  );
};
