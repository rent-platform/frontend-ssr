export type SortOption = 'recent' | 'priceAsc' | 'priceDesc' | 'name';

export const SORT_LABELS: Record<SortOption, string> = {
  recent: 'Недавние',
  priceAsc: 'Сначала дешёвые',
  priceDesc: 'Сначала дорогие',
  name: 'По названию',
};
