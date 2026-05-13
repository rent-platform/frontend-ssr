import { describe, it, expect } from 'vitest';
import type { PublicListing, PublicUser } from '../types';
import {
  publicListingToCatalogItem,
  TRUST_LABELS,
  RATING_DISTRIBUTION,
} from '../publicProfileHelpers';

const mockUser: PublicUser = {
  id: 'user-1',
  fullName: 'Иван Петров',
  nickname: 'ivan_rent',
  avatarUrl: 'https://example.com/avatar.jpg',
  bio: 'Сдаю технику',
  rating: 4.8,
  reviewCount: 54,
  memberSince: '2024-03-15',
  city: 'Новосибирск',
  isVerified: true,
  responseTime: '< 30 мин',
  responseRate: 98,
  completedDeals: 47,
  activeListings: 8,
  lastOnline: '2025-05-14T10:00:00Z',
  languages: ['Русский'],
  trustLevel: 'experienced',
};

const mockListing: PublicListing = {
  id: 'listing-1',
  title: 'Камера Canon',
  image: 'https://example.com/photo.jpg',
  category: 'Фото и видео',
  pricePerDay: '3500',
  isAvailable: true,
  rating: 4.9,
  reviewCount: 12,
};

describe('publicListingToCatalogItem', () => {
  it('маппит все основные поля из PublicListing', () => {
    const result = publicListingToCatalogItem(mockListing, mockUser);

    expect(result.id).toBe('listing-1');
    expect(result.title).toBe('Камера Canon');
    expect(result.category).toBe('Фото и видео');
    expect(result.pricePerDay).toBe('3500');
    expect(result.isAvailable).toBe(true);
  });

  it('маппит данные владельца из PublicUser', () => {
    const result = publicListingToCatalogItem(mockListing, mockUser);

    expect(result.ownerId).toBe('user-1');
    expect(result.ownerName).toBe('Иван Петров');
    expect(result.ownerAvatar).toBe('https://example.com/avatar.jpg');
    expect(result.ownerRating).toBe(4.9);
  });

  it('создаёт массив images из listing.image', () => {
    const result = publicListingToCatalogItem(mockListing, mockUser);
    expect(result.images).toEqual(['https://example.com/photo.jpg']);
    expect(result.coverImageUrl).toBe('https://example.com/photo.jpg');
  });

  it('обрабатывает listing без фото', () => {
    const listingNoImage = { ...mockListing, image: null };
    const result = publicListingToCatalogItem(listingNoImage, mockUser);
    expect(result.images).toEqual([]);
    expect(result.coverImageUrl).toBe('');
  });

  it('устанавливает дефолтные значения: pricePerHour, status, viewsCount', () => {
    const result = publicListingToCatalogItem(mockListing, mockUser);
    expect(result.pricePerHour).toBeNull();
    expect(result.status).toBe('ACTIVE');
    expect(result.viewsCount).toBe(0);
  });

  it('применяет overrides', () => {
    const result = publicListingToCatalogItem(mockListing, mockUser, {
      viewsCount: 999,
      featured: true,
    });
    expect(result.viewsCount).toBe(999);
    expect(result.featured).toBe(true);
  });

  it('pickupLocation берётся из user.city', () => {
    const result = publicListingToCatalogItem(mockListing, mockUser);
    expect(result.pickupLocation).toBe('Новосибирск');
  });

  it('createdAt берётся из user.memberSince', () => {
    const result = publicListingToCatalogItem(mockListing, mockUser);
    expect(result.createdAt).toBe('2024-03-15');
  });
});

describe('TRUST_LABELS', () => {
  it('содержит все 4 ключа', () => {
    const keys = Object.keys(TRUST_LABELS);
    expect(keys).toHaveLength(4);
    expect(keys).toContain('new');
    expect(keys).toContain('verified');
    expect(keys).toContain('experienced');
    expect(keys).toContain('super');
  });

  it('все значения — непустые строки', () => {
    Object.values(TRUST_LABELS).forEach((label) => {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });
});

describe('RATING_DISTRIBUTION', () => {
  it('содержит 5 элементов', () => {
    expect(RATING_DISTRIBUTION).toHaveLength(5);
  });

  it('stars от 5 до 1 по убыванию', () => {
    expect(RATING_DISTRIBUTION.map((d) => d.stars)).toEqual([5, 4, 3, 2, 1]);
  });

  it('каждый элемент имеет stars и count', () => {
    RATING_DISTRIBUTION.forEach((d) => {
      expect(d).toHaveProperty('stars');
      expect(d).toHaveProperty('count');
      expect(typeof d.stars).toBe('number');
      expect(typeof d.count).toBe('number');
    });
  });
});
