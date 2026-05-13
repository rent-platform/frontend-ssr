import type { ItemStatus } from '@/business/ads/types';

/** Human-readable labels for listing statuses */
export const UI_ITEM_STATUS_LABEL: Record<ItemStatus, string> = {
  ACTIVE: 'Активно',
  MODERATION: 'На модерации',
  DRAFT: 'Черновик',
  ARCHIVED: 'В архиве',
  REJECTED: 'Отклонено',
};
