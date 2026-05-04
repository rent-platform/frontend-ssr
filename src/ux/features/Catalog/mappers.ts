import type { CatalogItemCardVM } from '@/business/types';
import type { CatalogUiItem } from './types';

/**
 * Maps backend CatalogItemCardVM to frontend CatalogUiItem.
 *
 * Fields not available in the VM (owner info, images array, category name)
 * are filled with safe defaults. When the backend extends the VM,
 * update this mapper accordingly.
 */
export function mapCardVMtoUiItem(
  vm: CatalogItemCardVM,
  extra?: Partial<Pick<CatalogUiItem, 'category' | 'ownerName' | 'ownerAvatar' | 'ownerRating' | 'ownerReviewCount' | 'images'>>,
): CatalogUiItem {
  return {
    ...vm,
    category: extra?.category ?? '',
    ownerName: extra?.ownerName ?? '',
    ownerAvatar: extra?.ownerAvatar ?? null,
    ownerRating: extra?.ownerRating,
    ownerReviewCount: extra?.ownerReviewCount,
    images: extra?.images ?? (vm.coverImageUrl ? [vm.coverImageUrl] : []),
  };
}

/**
 * Batch mapper for lists.
 */
export function mapCardVMsToUiItems(
  vms: CatalogItemCardVM[],
  extraByIndex?: (index: number) => Partial<Pick<CatalogUiItem, 'category' | 'ownerName' | 'ownerAvatar' | 'ownerRating' | 'ownerReviewCount' | 'images'>>,
): CatalogUiItem[] {
  return vms.map((vm, i) => mapCardVMtoUiItem(vm, extraByIndex?.(i)));
}
