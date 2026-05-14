import { describe, it, expect, vi } from 'vitest';

// profileHelpers imports styles from a SCSS module — in jsdom, CSS modules
// return an empty object via vitest `css: true`. The styles are only used as
// class-name strings in maps, so this is safe.

import {
  profileListingToCatalogItem,
  getProfileCompletion,
  LISTING_FILTERS,
  BOOKING_FILTERS,
  ITEM_STATUS_MAP,
} from '@/ux/features/Profile/profileHelpers';
import type { ProfileUser, ProfileListing } from '@/ux/features/Profile/types';

const makeProfileListing = (overrides: Partial<ProfileListing> = {}): ProfileListing => ({
  id: 'item-001',
  title: 'Canon EOS R5',
  image: 'https://example.com/photo.jpg',
  images: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
  category: 'Фото и видео',
  pricePerDay: '3500',
  pricePerHour: '600',
  depositAmount: '15000',
  status: 'ACTIVE',
  viewsCount: 342,
  bookingsCount: 12,
  favoritesCount: 28,
  messagesCount: 9,
  location: 'Новосибирск, Центральный район',
  description: ['Профессиональная камера'],
  condition: 'Отличное',
  createdAt: '2024-06-10',
  ...overrides,
});

describe('profileListingToCatalogItem', () => {
  it('маппит основные поля из ProfileListing', () => {
    const listing = makeProfileListing();
    const result = profileListingToCatalogItem(listing);

    expect(result.id).toBe('item-001');
    expect(result.title).toBe('Canon EOS R5');
    expect(result.category).toBe('Фото и видео');
    expect(result.pricePerDay).toBe('3500');
    expect(result.pricePerHour).toBe('600');
    expect(result.depositAmount).toBe('15000');
    expect(result.status).toBe('ACTIVE');
    expect(result.viewsCount).toBe(342);
  });

  it('использует images из listing', () => {
    const listing = makeProfileListing();
    const result = profileListingToCatalogItem(listing);
    expect(result.images).toEqual(['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']);
  });

  it('fallback на image если images пуст', () => {
    const listing = makeProfileListing({ images: [], image: 'https://example.com/fallback.jpg' });
    const result = profileListingToCatalogItem(listing);
    expect(result.images).toEqual(['https://example.com/fallback.jpg']);
  });

  it('пустой images и null image → пустой массив', () => {
    const listing = makeProfileListing({ images: [], image: null });
    const result = profileListingToCatalogItem(listing);
    expect(result.images).toEqual([]);
  });

  it('isAvailable = true только для ACTIVE статуса', () => {
    expect(profileListingToCatalogItem(makeProfileListing({ status: 'ACTIVE' })).isAvailable).toBe(true);
    expect(profileListingToCatalogItem(makeProfileListing({ status: 'DRAFT' })).isAvailable).toBe(false);
    expect(profileListingToCatalogItem(makeProfileListing({ status: 'MODERATION' })).isAvailable).toBe(false);
    expect(profileListingToCatalogItem(makeProfileListing({ status: 'ARCHIVED' })).isAvailable).toBe(false);
  });

  it('featured = true если bookingsCount > 10', () => {
    expect(profileListingToCatalogItem(makeProfileListing({ bookingsCount: 11 })).featured).toBe(true);
    expect(profileListingToCatalogItem(makeProfileListing({ bookingsCount: 10 })).featured).toBe(false);
    expect(profileListingToCatalogItem(makeProfileListing({ bookingsCount: 5 })).featured).toBe(false);
  });

  it('pickupLocation берётся из listing.location', () => {
    const result = profileListingToCatalogItem(makeProfileListing());
    expect(result.pickupLocation).toBe('Новосибирск, Центральный район');
  });
});

describe('getProfileCompletion', () => {
  it('возвращает 100% для полного профиля', () => {
    const fullUser: ProfileUser = {
      id: 'u-1',
      fullName: 'Иван Петров',
      nickname: 'ivan',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Описание',
      phone: '+7 999 123-45-67',
      email: 'ivan@example.com',
      rating: 4.8,
      reviewCount: 10,
      memberSince: '2024-01-01',
    };
    expect(getProfileCompletion(fullUser)).toBe(100);
  });

  it('возвращает минимум для пустого профиля (только базовый балл 10)', () => {
    const emptyUser: ProfileUser = {
      id: 'u-2',
      fullName: 'Пользователь',
      nickname: null,
      avatarUrl: null,
      bio: null,
      phone: '',
      email: null,
      rating: 0,
      reviewCount: 0,
      memberSince: '2025-01-01',
    };
    expect(getProfileCompletion(emptyUser)).toBe(10);
  });

  it('частичное заполнение — avatar + phone = 50', () => {
    const partialUser: ProfileUser = {
      id: 'u-3',
      fullName: 'Пользователь',
      nickname: null,
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: null,
      phone: '+7 999 000-00-00',
      email: null,
      rating: 0,
      reviewCount: 0,
      memberSince: '2025-01-01',
    };
    // avatarUrl: +20, phone: +20, base: +10 = 50
    expect(getProfileCompletion(partialUser)).toBe(50);
  });

  it('не превышает 100', () => {
    const fullUser: ProfileUser = {
      id: 'u-1',
      fullName: 'Иван',
      nickname: 'ivan',
      avatarUrl: 'url',
      bio: 'bio',
      phone: 'phone',
      email: 'email',
      rating: 5,
      reviewCount: 100,
      memberSince: '2024-01-01',
    };
    expect(getProfileCompletion(fullUser)).toBeLessThanOrEqual(100);
  });
});

describe('LISTING_FILTERS', () => {
  it('содержит 6 элементов', () => {
    expect(LISTING_FILTERS).toHaveLength(6);
  });

  it('все values уникальны', () => {
    const values = LISTING_FILTERS.map((f) => f.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('первый элемент — "all"', () => {
    expect(LISTING_FILTERS[0].value).toBe('all');
  });

  it('каждый элемент имеет value, label, tip', () => {
    LISTING_FILTERS.forEach((f) => {
      expect(f).toHaveProperty('value');
      expect(f).toHaveProperty('label');
      expect(f).toHaveProperty('tip');
    });
  });
});

describe('BOOKING_FILTERS', () => {
  it('содержит 6 элементов', () => {
    expect(BOOKING_FILTERS).toHaveLength(6);
  });

  it('все values уникальны', () => {
    const values = BOOKING_FILTERS.map((f) => f.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('первый элемент — "all"', () => {
    expect(BOOKING_FILTERS[0].value).toBe('all');
  });
});

describe('ITEM_STATUS_MAP', () => {
  it('содержит все 5 статусов', () => {
    const keys = Object.keys(ITEM_STATUS_MAP);
    expect(keys).toHaveLength(5);
    expect(keys).toContain('ACTIVE');
    expect(keys).toContain('MODERATION');
    expect(keys).toContain('DRAFT');
    expect(keys).toContain('ARCHIVED');
    expect(keys).toContain('REJECTED');
  });

  it('каждый статус имеет label и cls', () => {
    Object.values(ITEM_STATUS_MAP).forEach((entry) => {
      expect(entry).toHaveProperty('label');
      expect(entry).toHaveProperty('cls');
      expect(typeof entry.label).toBe('string');
    });
  });
});
