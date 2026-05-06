import type { CatalogItemCardVM } from '@/business/ads';
import type { CatalogUiItem } from './types';

/**
 * Adds optional UI-only fields on top of the business CatalogItemCardVM.
 */
export function mapCardVMtoUiItem(
  vm: CatalogItemCardVM,
  extra?: Partial<Pick<CatalogUiItem, 'category' | 'ownerName' | 'ownerAvatar' | 'ownerRating' | 'ownerReviewCount' | 'images'>>,
): CatalogUiItem {
  return {
    ...vm,
    category: extra?.category ?? vm.category,
    ownerName: extra?.ownerName ?? vm.ownerName,
    ownerAvatar: extra?.ownerAvatar ?? vm.ownerAvatar,
    ownerRating: extra?.ownerRating ?? vm.ownerRating,
    ownerReviewCount: extra?.ownerReviewCount ?? vm.ownerReviewCount,
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
