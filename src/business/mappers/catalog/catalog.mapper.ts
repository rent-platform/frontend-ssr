import type { AdsItemResponseDto } from "@/business/types/dto/ads.dto";
import type {
  CatalogItemBaseVM,
  CatalogItemCardVM,
  CatalogItemDetailsVM,
} from "@/business/types/view";

function getSortedPhotoUrls(dto: AdsItemResponseDto): string[] {
  return [...(dto.photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((photo) => photo.photo_url);
}

function mapCatalogItemToBaseVM(dto: AdsItemResponseDto): CatalogItemBaseVM {
  return {
    id: dto.id,
    title: dto.title,
    pricePerDay: dto.price_per_day,
    pricePerHour: dto.price_per_hour,
    depositAmount: dto.deposit_amount,
    pickupLocation: dto.pickup_location,
    status: dto.status,
    viewsCount: dto.views_count,
    createdAt: dto.created_at,
    isAvailable: dto.is_available,
    nearestAvailableDate: dto.nearest_available_date,
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
    description: dto.item_description,
    photos: getSortedPhotoUrls(dto),
  };
}
