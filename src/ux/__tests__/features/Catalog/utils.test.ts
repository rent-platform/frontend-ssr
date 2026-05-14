import { describe, it, expect } from 'vitest';
import type { CatalogUiItem, CatalogFilterState } from '@/ux/features/Catalog/types';
import {
  formatDepositAmount,
  getAnnouncementsLabel,
  formatCatalogCardPrimaryPrice,
  formatCatalogCardHourSecondary,
  formatCatalogCardLocation,
  sortCatalogItems,
  applyCatalogFilters,
  filtersToSearchParams,
  searchParamsToFilters,
  getFilterSummaryItems,
  INITIAL_FILTERS,
} from '@/ux/features/Catalog/utils';

/* ─── Helpers ─── */

const makeItem = (overrides: Partial<CatalogUiItem> = {}): CatalogUiItem => ({
  id: 'item-1',
  title: 'Камера Canon',
  coverImageUrl: null,
  pricePerDay: '1500',
  pricePerHour: null,
  depositAmount: '5000',
  pickupLocation: 'Центр',
  status: 'ACTIVE',
  viewsCount: 100,
  createdAt: '2025-01-01',
  isAvailable: true,
  nearestAvailableDate: null,
  category: 'Фото и видео',
  ownerId: 'u-1',
  ownerName: 'Владелец',
  ownerAvatar: null,
  images: [],
  city: 'Новосибирск',
  quickFilters: [],
  ...overrides,
});

/* ─── formatDepositAmount ─── */

describe('formatDepositAmount', () => {
  it('возвращает "по запросу" при null', () => {
    expect(formatDepositAmount(null)).toBe('по запросу');
  });

  it('возвращает "по запросу" при пустой строке', () => {
    expect(formatDepositAmount('')).toBe('по запросу');
  });

  it('форматирует число "5000" → "5 000 ₽"', () => {
    const result = formatDepositAmount('5000');
    expect(result).toContain('5');
    expect(result).toContain('000');
    expect(result).toContain('₽');
  });

  it('форматирует строку с пробелами "5 000"', () => {
    const result = formatDepositAmount('5 000');
    expect(result).toContain('5');
    expect(result).toContain('000');
    expect(result).toContain('₽');
  });
});

/* ─── getAnnouncementsLabel ─── */

describe('getAnnouncementsLabel', () => {
  it('1 → "объявление"', () => {
    expect(getAnnouncementsLabel(1)).toBe('объявление');
  });

  it('3 → "объявления"', () => {
    expect(getAnnouncementsLabel(3)).toBe('объявления');
  });

  it('5 → "объявлений"', () => {
    expect(getAnnouncementsLabel(5)).toBe('объявлений');
  });

  it('11 → "объявлений"', () => {
    expect(getAnnouncementsLabel(11)).toBe('объявлений');
  });

  it('21 → "объявление"', () => {
    expect(getAnnouncementsLabel(21)).toBe('объявление');
  });
});

/* ─── formatCatalogCardPrimaryPrice ─── */

describe('formatCatalogCardPrimaryPrice', () => {
  it('форматирует цену за сутки', () => {
    const item = makeItem({ pricePerDay: '1500' });
    const result = formatCatalogCardPrimaryPrice(item);
    expect(result).toContain('500');
    expect(result).toContain('₽/сутки');
  });

  it('возвращает "По запросу" если нет цены', () => {
    const item = makeItem({ pricePerDay: null });
    expect(formatCatalogCardPrimaryPrice(item)).toBe('По запросу');
  });
});

/* ─── formatCatalogCardHourSecondary ─── */

describe('formatCatalogCardHourSecondary', () => {
  it('возвращает null если нет часовой цены', () => {
    const item = makeItem({ pricePerDay: '1500', pricePerHour: null });
    expect(formatCatalogCardHourSecondary(item)).toBeNull();
  });

  it('возвращает null если нет суточной цены', () => {
    const item = makeItem({ pricePerDay: null, pricePerHour: '300' });
    expect(formatCatalogCardHourSecondary(item)).toBeNull();
  });

  it('возвращает цену за час если есть обе цены', () => {
    const item = makeItem({ pricePerDay: '1500', pricePerHour: '300' });
    const result = formatCatalogCardHourSecondary(item);
    expect(result).not.toBeNull();
    expect(result).toContain('300');
    expect(result).toContain('₽/час');
  });
});

/* ─── formatCatalogCardLocation ─── */

describe('formatCatalogCardLocation', () => {
  it('возвращает только город если pickupLocation пуст', () => {
    const item = makeItem({ city: 'Москва', pickupLocation: '' });
    expect(formatCatalogCardLocation(item)).toBe('Москва');
  });

  it('возвращает "Адрес не указан" если оба пусты', () => {
    const item = makeItem({ city: '', pickupLocation: '' });
    expect(formatCatalogCardLocation(item)).toBe('Адрес не указан');
  });

  it('возвращает только pickupLocation если city пуст', () => {
    const item = makeItem({ city: '', pickupLocation: 'ул. Ленина 1' });
    expect(formatCatalogCardLocation(item)).toBe('ул. Ленина 1');
  });

  it('объединяет город и адрес через запятую', () => {
    const item = makeItem({ city: 'Москва', pickupLocation: 'Центр' });
    expect(formatCatalogCardLocation(item)).toBe('Москва, Центр');
  });

  it('не дублирует город если pickupLocation начинается с города', () => {
    const item = makeItem({ city: 'Москва', pickupLocation: 'Москва, Центр' });
    expect(formatCatalogCardLocation(item)).toBe('Москва, Центр');
  });

  it('не дублирует если pickupLocation === city', () => {
    const item = makeItem({ city: 'Москва', pickupLocation: 'Москва' });
    expect(formatCatalogCardLocation(item)).toBe('Москва');
  });

  it('обрабатывает undefined город', () => {
    const item = makeItem({ city: undefined, pickupLocation: 'Центр' });
    expect(formatCatalogCardLocation(item)).toBe('Центр');
  });
});

/* ─── sortCatalogItems ─── */

describe('sortCatalogItems', () => {
  const items: CatalogUiItem[] = [
    makeItem({ id: 'a', pricePerDay: '1000', viewsCount: 50, createdAt: '2025-01-01' }),
    makeItem({ id: 'b', pricePerDay: '500', viewsCount: 200, createdAt: '2025-03-01' }),
    makeItem({ id: 'c', pricePerDay: '2000', viewsCount: 10, createdAt: '2025-02-01' }),
  ];

  it('priceAsc — сортировка по цене по возрастанию', () => {
    const sorted = sortCatalogItems(items, 'priceAsc');
    expect(sorted[0].id).toBe('b');
    expect(sorted[1].id).toBe('a');
    expect(sorted[2].id).toBe('c');
  });

  it('priceDesc — сортировка по цене по убыванию', () => {
    const sorted = sortCatalogItems(items, 'priceDesc');
    expect(sorted[0].id).toBe('c');
    expect(sorted[2].id).toBe('b');
  });

  it('newest — сортировка по дате (новые первыми)', () => {
    const sorted = sortCatalogItems(items, 'newest');
    expect(sorted[0].id).toBe('b');
    expect(sorted[1].id).toBe('c');
    expect(sorted[2].id).toBe('a');
  });

  it('popular — сортировка по просмотрам (популярные первыми)', () => {
    const sorted = sortCatalogItems(items, 'popular');
    expect(sorted[0].id).toBe('b');
    expect(sorted[2].id).toBe('c');
  });

  it('не мутирует исходный массив', () => {
    const original = [...items];
    sortCatalogItems(items, 'priceAsc');
    expect(items.map((i) => i.id)).toEqual(original.map((i) => i.id));
  });
});

/* ─── applyCatalogFilters ─── */

describe('applyCatalogFilters', () => {
  const items: CatalogUiItem[] = [
    makeItem({ id: '1', title: 'Камера Canon', category: 'Фото и видео', city: 'Новосибирск', pricePerDay: '1500', isAvailable: true, viewsCount: 100, quickFilters: ['Топ-рейтинг'] }),
    makeItem({ id: '2', title: 'Дрон DJI', category: 'Электроника', city: 'Москва', pricePerDay: '4000', isAvailable: false, viewsCount: 200, quickFilters: ['Новинки'] }),
    makeItem({ id: '3', title: 'Перфоратор Bosch', category: 'Инструменты', city: 'Новосибирск', pricePerDay: '600', isAvailable: true, viewsCount: 50 }),
  ];

  it('фильтрует по поисковому запросу', () => {
    const filters: CatalogFilterState = { ...INITIAL_FILTERS, search: 'Камера', city: 'Все города', onlyAvailable: false };
    const result = applyCatalogFilters(items, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('фильтрует по категории', () => {
    const filters: CatalogFilterState = { ...INITIAL_FILTERS, category: 'Электроника', city: 'Все города', onlyAvailable: false };
    const result = applyCatalogFilters(items, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('фильтрует по городу', () => {
    const filters: CatalogFilterState = { ...INITIAL_FILTERS, city: 'Москва', onlyAvailable: false };
    const result = applyCatalogFilters(items, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('фильтрует по диапазону цен', () => {
    const filters: CatalogFilterState = { ...INITIAL_FILTERS, minPrice: '1000', maxPrice: '2000', city: 'Все города', onlyAvailable: false };
    const result = applyCatalogFilters(items, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('фильтрует по доступности', () => {
    const filters: CatalogFilterState = { ...INITIAL_FILTERS, onlyAvailable: true, city: 'Все города' };
    const result = applyCatalogFilters(items, filters);
    expect(result.every((i) => i.isAvailable)).toBe(true);
  });

  it('фильтрует по quickFilter', () => {
    const filters: CatalogFilterState = { ...INITIAL_FILTERS, quickFilter: 'Новинки', city: 'Все города', onlyAvailable: false };
    const result = applyCatalogFilters(items, filters);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('возвращает все при дефолтных фильтрах без ограничения по городу', () => {
    const filters: CatalogFilterState = { ...INITIAL_FILTERS, city: 'Все города', onlyAvailable: false };
    const result = applyCatalogFilters(items, filters);
    expect(result).toHaveLength(3);
  });
});

/* ─── filtersToSearchParams / searchParamsToFilters round-trip ─── */

describe('filtersToSearchParams / searchParamsToFilters', () => {
  it('round-trip: filters → params → filters совпадают', () => {
    const filters: CatalogFilterState = {
      search: 'камера',
      city: 'Москва',
      category: 'Электроника',
      minPrice: '500',
      maxPrice: '5000',
      onlyAvailable: false,
      sortBy: 'priceAsc',
      quickFilter: 'Новинки',
      hasDeposit: 'no',
    };
    const params = filtersToSearchParams(filters);
    const parsed = searchParamsToFilters(new URLSearchParams(params));
    expect(parsed).toEqual(filters);
  });

  it('дефолтные фильтры не добавляют параметров', () => {
    const params = filtersToSearchParams(INITIAL_FILTERS);
    expect(params).toBe('');
  });

  it('парсит пустые параметры в дефолтные фильтры', () => {
    const parsed = searchParamsToFilters(new URLSearchParams(''));
    expect(parsed).toEqual(INITIAL_FILTERS);
  });
});

/* ─── getFilterSummaryItems ─── */

describe('getFilterSummaryItems', () => {
  it('возвращает пустой массив для дефолтных фильтров', () => {
    expect(getFilterSummaryItems(INITIAL_FILTERS)).toEqual([]);
  });

  it('добавляет чип города если отличается от дефолтного', () => {
    const items = getFilterSummaryItems({ ...INITIAL_FILTERS, city: 'Москва' });
    expect(items).toContain('Москва');
  });

  it('добавляет чип категории если отличается', () => {
    const items = getFilterSummaryItems({ ...INITIAL_FILTERS, category: 'Электроника' });
    expect(items).toContain('Электроника');
  });

  it('добавляет чип цены если задан minPrice или maxPrice', () => {
    const items = getFilterSummaryItems({ ...INITIAL_FILTERS, minPrice: '500', maxPrice: '2000' });
    expect(items.some((i) => i.includes('от 500 ₽'))).toBe(true);
    expect(items.some((i) => i.includes('до 2000 ₽'))).toBe(true);
  });

  it('добавляет чип "Без залога" при hasDeposit=no', () => {
    const items = getFilterSummaryItems({ ...INITIAL_FILTERS, hasDeposit: 'no' });
    expect(items).toContain('Без залога');
  });

  it('добавляет чип quickFilter', () => {
    const items = getFilterSummaryItems({ ...INITIAL_FILTERS, quickFilter: 'Топ-рейтинг' });
    expect(items).toContain('Топ-рейтинг');
  });

  it('добавляет "Все предложения" если onlyAvailable=false', () => {
    const items = getFilterSummaryItems({ ...INITIAL_FILTERS, onlyAvailable: false });
    expect(items).toContain('Все предложения');
  });
});
