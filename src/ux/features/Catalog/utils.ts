import { pluralize } from '@/ux/utils';
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

export const QUICK_FILTER_OPTIONS = [
  'Рядом сегодня',
  'С доставкой',
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
  return pluralize(count, 'объявление', 'объявления', 'объявлений');
};

/** Карточка каталога: основная строка — только сутки. */
export const formatCatalogCardPrimaryPrice = (item: CatalogUiItem) =>
  formatPrice(item.pricePerDay, '/сутки');

/** Вторая строка под ценой: только ₽/час, если заданы и сутки, и час. */
export const formatCatalogCardHourSecondary = (item: CatalogUiItem): string | null =>
  item.pricePerDay && item.pricePerHour
    ? formatPrice(item.pricePerHour, '/час')
    : null;

/** Город и адрес/район без дублирования города в строке выдачи. */
export const formatCatalogCardLocation = (item: CatalogUiItem): string => {
  const city = (item.city ?? '').trim();
  const detail = (item.pickupLocation ?? '').trim();
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
      return sorted.sort((a, b) => priceToNumber(a.pricePerDay) - priceToNumber(b.pricePerDay));
    case 'priceDesc':
      return sorted.sort((a, b) => priceToNumber(b.pricePerDay) - priceToNumber(a.pricePerDay));
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'popular':
    default:
      return sorted.sort((a, b) => b.viewsCount - a.viewsCount);
  }
};

/* ─── URL ↔ Filters serialization ─── */

export const filtersToSearchParams = (filters: CatalogFilterState): string => {
  const params = new URLSearchParams();

  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.city !== INITIAL_FILTERS.city) params.set('city', filters.city);
  if (filters.category !== INITIAL_FILTERS.category) params.set('category', filters.category);
  if (filters.minPrice) params.set('minPrice', filters.minPrice);
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
  if (filters.onlyAvailable !== INITIAL_FILTERS.onlyAvailable) params.set('onlyAvailable', String(filters.onlyAvailable));
  if (filters.sortBy !== INITIAL_FILTERS.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.quickFilter) params.set('quickFilter', filters.quickFilter);
  if (filters.hasDeposit !== INITIAL_FILTERS.hasDeposit) params.set('hasDeposit', filters.hasDeposit);

  return params.toString();
};

export const searchParamsToFilters = (params: URLSearchParams): CatalogFilterState => ({
  search: params.get('search') ?? INITIAL_FILTERS.search,
  city: params.get('city') ?? INITIAL_FILTERS.city,
  category: params.get('category') ?? INITIAL_FILTERS.category,
  minPrice: params.get('minPrice') ?? INITIAL_FILTERS.minPrice,
  maxPrice: params.get('maxPrice') ?? INITIAL_FILTERS.maxPrice,
  onlyAvailable: params.has('onlyAvailable') ? params.get('onlyAvailable') === 'true' : INITIAL_FILTERS.onlyAvailable,
  sortBy: (params.get('sortBy') as CatalogSortKey) ?? INITIAL_FILTERS.sortBy,
  quickFilter: params.get('quickFilter') ?? INITIAL_FILTERS.quickFilter,
  hasDeposit: (params.get('hasDeposit') as CatalogFilterState['hasDeposit']) ?? INITIAL_FILTERS.hasDeposit,
});

export const applyCatalogFilters = (
  items: CatalogUiItem[],
  filters: CatalogFilterState,
) => {
  const query = filters.search.trim().toLowerCase();
  const minPrice = filters.minPrice ? Number(filters.minPrice) : 0;
  const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : Infinity;

  return sortCatalogItems(
    items.filter((item) => {
      const primaryPrice = Number(item.pricePerDay ?? 0);

      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.description ?? []).some((d) => d.toLowerCase().includes(query)) ||
        (item.tags ?? []).some((tag) => tag.toLowerCase().includes(query));

      const matchesCategory =
        filters.category === 'Все категории' || item.category === filters.category;

      const matchesCity =
        filters.city === 'Все города' || item.city === filters.city;

      const matchesAvailability = !filters.onlyAvailable || item.isAvailable;

      const matchesPrice = primaryPrice >= minPrice && primaryPrice <= maxPrice;

      const matchesQuickFilter =
        !filters.quickFilter || (item.quickFilters ?? []).includes(filters.quickFilter);

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
