import { describe, it, expect } from 'vitest';
import type { CatalogItemCardVM } from '@/business/ads/types';
import { mapCardVMtoUiItem, mapCardVMsToUiItems } from '@/ux/features/Catalog/mappers';

const makeVM = (overrides: Partial<CatalogItemCardVM> = {}): CatalogItemCardVM => ({
  id: 'vm-1',
  title: 'Камера Canon',
  pricePerDay: '3500',
  pricePerHour: '600',
  depositAmount: '15000',
  pickupLocation: 'Новосибирск',
  status: 'ACTIVE',
  viewsCount: 100,
  createdAt: '2025-01-01',
  isAvailable: true,
  nearestAvailableDate: null,
  coverImageUrl: 'https://example.com/photo.jpg',
  ...overrides,
});

describe('mapCardVMtoUiItem', () => {
  it('маппит VM без extras — используются дефолты', () => {
    const vm = makeVM();
    const result = mapCardVMtoUiItem(vm);

    expect(result.id).toBe('vm-1');
    expect(result.title).toBe('Камера Canon');
    expect(result.pricePerDay).toBe('3500');
    expect(result.category).toBe('');
    expect(result.ownerId).toBe('');
    expect(result.ownerName).toBe('');
    expect(result.ownerAvatar).toBeNull();
    expect(result.ownerRating).toBeUndefined();
    expect(result.ownerReviewCount).toBeUndefined();
    expect(result.images).toEqual(['https://example.com/photo.jpg']);
  });

  it('маппит VM с extras — данные из extras имеют приоритет', () => {
    const vm = makeVM();
    const result = mapCardVMtoUiItem(vm, {
      category: 'Фото и видео',
      ownerId: 'u-42',
      ownerName: 'Иван',
      ownerAvatar: 'https://example.com/avatar.jpg',
      ownerRating: 4.8,
      ownerReviewCount: 54,
      images: ['img1.jpg', 'img2.jpg'],
    });

    expect(result.category).toBe('Фото и видео');
    expect(result.ownerId).toBe('u-42');
    expect(result.ownerName).toBe('Иван');
    expect(result.ownerAvatar).toBe('https://example.com/avatar.jpg');
    expect(result.ownerRating).toBe(4.8);
    expect(result.ownerReviewCount).toBe(54);
    expect(result.images).toEqual(['img1.jpg', 'img2.jpg']);
  });

  it('без coverImageUrl и без extras.images → пустой массив images', () => {
    const vm = makeVM({ coverImageUrl: null });
    const result = mapCardVMtoUiItem(vm);
    expect(result.images).toEqual([]);
  });

  it('сохраняет все поля VM', () => {
    const vm = makeVM();
    const result = mapCardVMtoUiItem(vm);

    expect(result.pricePerHour).toBe('600');
    expect(result.depositAmount).toBe('15000');
    expect(result.pickupLocation).toBe('Новосибирск');
    expect(result.status).toBe('ACTIVE');
    expect(result.viewsCount).toBe(100);
    expect(result.isAvailable).toBe(true);
  });
});

describe('mapCardVMsToUiItems', () => {
  it('маппит массив VM', () => {
    const vms = [
      makeVM({ id: 'vm-1' }),
      makeVM({ id: 'vm-2' }),
      makeVM({ id: 'vm-3' }),
    ];
    const result = mapCardVMsToUiItems(vms);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('vm-1');
    expect(result[1].id).toBe('vm-2');
    expect(result[2].id).toBe('vm-3');
  });

  it('передаёт extraByIndex каждому элементу', () => {
    const vms = [makeVM({ id: 'vm-1' }), makeVM({ id: 'vm-2' })];
    const categories = ['Фото', 'Спорт'];
    const result = mapCardVMsToUiItems(vms, (i) => ({ category: categories[i] }));

    expect(result[0].category).toBe('Фото');
    expect(result[1].category).toBe('Спорт');
  });

  it('без extraByIndex используются дефолты', () => {
    const vms = [makeVM()];
    const result = mapCardVMsToUiItems(vms);
    expect(result[0].category).toBe('');
    expect(result[0].ownerId).toBe('');
  });

  it('пустой массив → пустой результат', () => {
    expect(mapCardVMsToUiItems([])).toEqual([]);
  });
});
