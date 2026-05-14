import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatPrice,
  getNumericPrice,
  timeAgo,
  formatTime,
  formatDateRange,
  formatDate,
  formatPriceNum,
  formatMoney,
  formatNumber,
  formatDateTime,
  formatDateTimeFull,
  getInitials,
} from '@/ux/utils/format';

describe('formatPrice', () => {
  it('возвращает "По запросу" при null', () => {
    expect(formatPrice(null)).toBe('По запросу');
  });

  it('возвращает "По запросу" при пустой строке', () => {
    expect(formatPrice('')).toBe('По запросу');
  });

  it('форматирует число с разделителем тысяч и символом ₽', () => {
    const result = formatPrice('1500');
    expect(result).toContain('1');
    expect(result).toContain('500');
    expect(result).toContain('₽');
  });

  it('форматирует число без разделителя если < 1000', () => {
    expect(formatPrice('500')).toBe('500 ₽');
  });

  it('добавляет суффикс после символа ₽', () => {
    const result = formatPrice('1500', '/сутки');
    expect(result).toContain('₽/сутки');
    expect(result).toContain('500');
  });

  it('добавляет суффикс /час', () => {
    expect(formatPrice('800', '/час')).toBe('800 ₽/час');
  });
});

describe('getNumericPrice', () => {
  it('возвращает 0 при null', () => {
    expect(getNumericPrice(null)).toBe(0);
  });

  it('возвращает 0 при пустой строке', () => {
    expect(getNumericPrice('')).toBe(0);
  });

  it('парсит строку без пробелов', () => {
    expect(getNumericPrice('1500')).toBe(1500);
  });

  it('обрабатывает строку "1 500" (пробел заменяется на точку)', () => {
    // Функция заменяет пробелы на точки: '1 500' → '1.500' → 1.5
    expect(getNumericPrice('1 500')).toBe(1.5);
  });

  it('парсит строку без пробелов "1500"', () => {
    expect(getNumericPrice('1500')).toBe(1500);
  });

  it('заменяет запятую на точку: "1,5" → 1.5', () => {
    expect(getNumericPrice('1,5')).toBe(1.5);
  });
});

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-05-14T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('возвращает "только что" для < 60 секунд назад', () => {
    const iso = new Date(Date.now() - 30 * 1000).toISOString();
    expect(timeAgo(iso)).toBe('только что');
  });

  it('возвращает "N мин. назад" для < 60 минут', () => {
    const iso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(iso)).toBe('5 мин. назад');
  });

  it('возвращает "N ч. назад" для < 24 часов', () => {
    const iso = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    expect(timeAgo(iso)).toBe('3 ч. назад');
  });

  it('возвращает "N дн. назад" для <= 7 дней', () => {
    const iso = new Date(Date.now() - 5 * 86400 * 1000).toISOString();
    expect(timeAgo(iso)).toBe('5 дн. назад');
  });

  it('возвращает дату для > 7 дней', () => {
    const iso = new Date('2025-04-01T00:00:00Z').toISOString();
    const result = timeAgo(iso);
    expect(result).toContain('1');
    expect(result).toContain('апр');
  });
});

describe('formatTime', () => {
  it('форматирует время в формате HH:MM', () => {
    const result = formatTime('2025-05-14T14:30:00Z');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe('formatDateRange', () => {
  it('форматирует диапазон дат', () => {
    const result = formatDateRange('2025-01-05', '2025-01-10');
    expect(result).toContain('—');
    expect(result).toContain('5');
    expect(result).toContain('10');
  });
});

describe('formatDate', () => {
  it('форматирует дату с коротким месяцем (short)', () => {
    const result = formatDate('2025-01-05', 'short');
    expect(result).toContain('5');
    expect(result).toContain('2025');
  });

  it('форматирует дату с длинным месяцем (long)', () => {
    const result = formatDate('2025-01-05', 'long');
    expect(result).toContain('5');
    expect(result).toContain('2025');
    expect(result).toContain('январ');
  });

  it('по умолчанию использует short', () => {
    const result = formatDate('2025-06-15');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});

describe('formatPriceNum', () => {
  it('возвращает "—" при null', () => {
    expect(formatPriceNum(null)).toBe('—');
  });

  it('возвращает "—" при undefined', () => {
    expect(formatPriceNum(undefined)).toBe('—');
  });

  it('форматирует число с символом ₽', () => {
    const result = formatPriceNum(1500);
    expect(result).toContain('500');
    expect(result).toContain('₽');
  });

  it('форматирует 0', () => {
    expect(formatPriceNum(0)).toContain('₽');
  });
});

describe('formatMoney', () => {
  it('форматирует значение >= 1 000 000 как млн', () => {
    expect(formatMoney(1_500_000)).toBe('1.5 млн ₽');
  });

  it('форматирует значение >= 1 000 как тыс.', () => {
    expect(formatMoney(15_000)).toBe('15 тыс. ₽');
  });

  it('форматирует значение >= 1 000 (ровно 1 500)', () => {
    expect(formatMoney(1_500)).toBe('2 тыс. ₽');
  });

  it('форматирует значение < 1 000 как обычное', () => {
    const result = formatMoney(500);
    expect(result).toContain('500');
    expect(result).toContain('₽');
  });
});

describe('formatNumber', () => {
  it('форматирует число с разделителем тысяч', () => {
    const result = formatNumber(12345);
    expect(result).toMatch(/12[\s\u00a0]345/);
  });

  it('не добавляет разделитель для < 1000', () => {
    expect(formatNumber(999)).toBe('999');
  });
});

describe('formatDateTime', () => {
  it('возвращает строку с датой и временем', () => {
    const result = formatDateTime('2025-01-05T14:30:00Z');
    expect(result).toContain('5');
  });
});

describe('formatDateTimeFull', () => {
  it('возвращает строку с датой, годом и временем', () => {
    const result = formatDateTimeFull('2025-01-05T14:30:00Z');
    expect(result).toContain('2025');
    expect(result).toContain('5');
  });
});

describe('getInitials', () => {
  it('возвращает инициалы из двух слов: "Иван Петров" → "ИП"', () => {
    expect(getInitials('Иван Петров')).toBe('ИП');
  });

  it('возвращает одну букву из одного слова: "Иван" → "И"', () => {
    expect(getInitials('Иван')).toBe('И');
  });

  it('обрезает до 2 символов при трёх словах', () => {
    expect(getInitials('Анна Мария Сергеевна')).toBe('АМ');
  });

  it('возвращает пустую строку для пустого имени', () => {
    expect(getInitials('')).toBe('');
  });
});
