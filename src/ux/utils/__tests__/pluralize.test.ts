import { describe, it, expect } from 'vitest';
import { pluralize } from '../pluralize';

describe('pluralize', () => {
  const forms = ['отзыв', 'отзыва', 'отзывов'] as const;

  it('возвращает форму "один" для 1', () => {
    expect(pluralize(1, ...forms)).toBe('отзыв');
  });

  it('возвращает форму "несколько" для 2', () => {
    expect(pluralize(2, ...forms)).toBe('отзыва');
  });

  it('возвращает форму "несколько" для 3', () => {
    expect(pluralize(3, ...forms)).toBe('отзыва');
  });

  it('возвращает форму "несколько" для 4', () => {
    expect(pluralize(4, ...forms)).toBe('отзыва');
  });

  it('возвращает форму "много" для 5', () => {
    expect(pluralize(5, ...forms)).toBe('отзывов');
  });

  it('возвращает форму "много" для 0', () => {
    expect(pluralize(0, ...forms)).toBe('отзывов');
  });

  it('возвращает форму "много" для 11 (исключение 11-19)', () => {
    expect(pluralize(11, ...forms)).toBe('отзывов');
  });

  it('возвращает форму "много" для 12', () => {
    expect(pluralize(12, ...forms)).toBe('отзывов');
  });

  it('возвращает форму "много" для 14', () => {
    expect(pluralize(14, ...forms)).toBe('отзывов');
  });

  it('возвращает форму "много" для 19', () => {
    expect(pluralize(19, ...forms)).toBe('отзывов');
  });

  it('возвращает форму "один" для 21', () => {
    expect(pluralize(21, ...forms)).toBe('отзыв');
  });

  it('возвращает форму "несколько" для 22', () => {
    expect(pluralize(22, ...forms)).toBe('отзыва');
  });

  it('возвращает форму "много" для 25', () => {
    expect(pluralize(25, ...forms)).toBe('отзывов');
  });

  it('возвращает форму "один" для 101', () => {
    expect(pluralize(101, ...forms)).toBe('отзыв');
  });

  it('возвращает форму "много" для 111', () => {
    expect(pluralize(111, ...forms)).toBe('отзывов');
  });
});
