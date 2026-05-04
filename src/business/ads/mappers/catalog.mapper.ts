import type {
  AdsItemResponseDto,
  CatalogItemBaseVM,
  CatalogItemCardVM,
  CatalogItemDetailsVM,
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

function mapCatalogItemToBaseVM(dto: AdsItemResponseDto): CatalogItemBaseVM {
  return {
    id: dto.id,
    title: dto.title,
    pricePerDay: toNullableString(dto.pricePerDay),
    pricePerHour: toNullableString(dto.pricePerHour),
    depositAmount: toNullableString(dto.depositAmount) ?? "0",
    pickupLocation: dto.pickupLocation ?? dto.city ?? null,
    status: dto.status,
    viewsCount: dto.viewsCount ?? 0,
    createdAt: dto.createdAt ?? "",
    isAvailable: dto.isAvailable ?? dto.status === "ACTIVE",
    nearestAvailableDate: dto.nearestAvailableDate ?? null,
  };
}

export function mapCatalogItemToCardVM(
  dto: AdsItemResponseDto,
): CatalogItemCardVM {
  const photoUrls = getSortedPhotoUrls(dto);

  return {
    ...mapCatalogItemToBaseVM(dto),
    coverImageUrl: photoUrls[0] ?? null,
  };
}

export function mapCatalogItemToDetailsVM(
  dto: AdsItemResponseDto,
): CatalogItemDetailsVM {
  return {
    ...mapCatalogItemToBaseVM(dto),
    description: dto.itemDescription ?? null,
    photos: getSortedPhotoUrls(dto),
  };
}
