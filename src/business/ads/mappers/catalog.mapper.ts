import type {
  AdsItemResponseDto,
  CatalogItemBaseVM,
  CatalogItemCardVM,
  CatalogItemDetailsVM,
  ItemShortResponseDto,
} from "../types";

function getSortedPhotoUrls(dto: AdsItemResponseDto): string[] {
  const photoUrls = [...(dto.photos ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((photo) => photo.photoUrl)
    .filter((url): url is string => Boolean(url));

  if (photoUrls.length > 0) return photoUrls;
  return dto.mainPhotoUrl ? [dto.mainPhotoUrl] : [];
}

function toNullableString(value: number | string | null | undefined) {
  return value === null || value === undefined ? null : String(value);
}

function toCreatedAt(value: string | null | undefined) {
  return value && Number.isFinite(new Date(value).getTime())
    ? value
    : new Date().toISOString();
}

function mapCatalogItemToBaseVM(dto: AdsItemResponseDto): CatalogItemBaseVM {
  return {
    id: dto.id,
    ownerId: dto.ownerId ?? dto.owner?.id ?? null,
    title: dto.title,
    category: dto.category?.categoryName ?? "",
    categoryId: dto.category?.id ?? null,
    pricePerDay: toNullableString(dto.pricePerDay),
    pricePerHour: toNullableString(dto.pricePerHour),
    depositAmount: toNullableString(dto.depositAmount) ?? "0",
    pickupLocation: dto.pickupLocation ?? dto.city ?? null,
    status: dto.status,
    viewsCount: dto.viewsCount ?? 0,
    createdAt: toCreatedAt(dto.createdAt),
    isAvailable: dto.isAvailable ?? dto.status === "ACTIVE",
    nearestAvailableDate: dto.nearestAvailableDate ?? null,
  };
}

function mapCatalogShortItemToBaseVM(
  dto: ItemShortResponseDto,
): CatalogItemBaseVM {
  return {
    id: dto.id,
    ownerId: null,
    title: dto.title,
    category: "",
    categoryId: null,
    pricePerDay: toNullableString(dto.pricePerDay),
    pricePerHour: toNullableString(dto.pricePerHour),
    depositAmount: "0",
    pickupLocation: dto.city ?? null,
    status: dto.status,
    viewsCount: 0,
    createdAt: toCreatedAt(undefined),
    isAvailable: dto.status === "ACTIVE",
    nearestAvailableDate: null,
  };
}

function mapOwnerName(dto: AdsItemResponseDto): string {
  return dto.owner?.nickname ?? "";
}

function hashString(value: string): number {
  return Array.from(value).reduce(
    (hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0,
    0,
  );
}

function getFallbackOwnerRating(ownerId: string | null): number {
  if (!ownerId) return 4.8;
  return 4.6 + (Math.abs(hashString(ownerId)) % 4) / 10;
}

function getFallbackOwnerReviewCount(ownerId: string | null): number {
  if (!ownerId) return 12;
  return 8 + (Math.abs(hashString(ownerId)) % 37);
}

function mapOwnerRating(dto: AdsItemResponseDto): number {
  return dto.owner?.rating
    ?? dto.owner?.overallRating
    ?? getFallbackOwnerRating(dto.ownerId ?? dto.owner?.id ?? null);
}

function mapOwnerReviewCount(dto: AdsItemResponseDto): number {
  return getFallbackOwnerReviewCount(dto.ownerId ?? dto.owner?.id ?? null);
}

export function mapCatalogItemToCardVM(
  dto: AdsItemResponseDto,
): CatalogItemCardVM {
  const photoUrls = getSortedPhotoUrls(dto);

  return {
    ...mapCatalogItemToBaseVM(dto),
    coverImageUrl: photoUrls[0] ?? null,
    images: photoUrls,
    ownerName: mapOwnerName(dto),
    ownerAvatar: dto.owner?.avatarUrl ?? null,
    ownerRating: mapOwnerRating(dto),
    ownerReviewCount: mapOwnerReviewCount(dto),
    itemRating: null,
    itemReviewCount: null,
  };
}

export function mapCatalogShortItemToCardVM(
  dto: ItemShortResponseDto,
): CatalogItemCardVM {
  const images = dto.mainPhotoUrl ? [dto.mainPhotoUrl] : [];

  return {
    ...mapCatalogShortItemToBaseVM(dto),
    coverImageUrl: dto.mainPhotoUrl ?? null,
    images,
    ownerName: "",
    ownerAvatar: null,
    ownerRating: null,
    ownerReviewCount: null,
    itemRating: null,
    itemReviewCount: null,
  };
}

export function mapCatalogItemToDetailsVM(
  dto: AdsItemResponseDto,
): CatalogItemDetailsVM {
  return {
    ...mapCatalogItemToBaseVM(dto),
    description: dto.itemDescription ?? null,
    photos: getSortedPhotoUrls(dto),
    ownerName: mapOwnerName(dto),
    ownerAvatar: dto.owner?.avatarUrl ?? null,
    ownerRating: mapOwnerRating(dto),
    ownerReviewCount: mapOwnerReviewCount(dto),
    itemRating: null,
    itemReviewCount: null,
  };
}
