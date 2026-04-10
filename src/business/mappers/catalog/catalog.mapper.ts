import type { AdsItemResponseDto } from "@/business/types/dto/ads.dto";
import type { CatalogItemCardVM } from "@/business/types/view/catalog.view";

export function mapCatalogItemToVM(dto: AdsItemResponseDto): CatalogItemCardVM {
  const sortedPhotos = [...dto.photos].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return {
    id: dto.id,
    title: dto.title,
    imageUrl: sortedPhotos[0]?.photo_url ?? null,
    item_description: dto.item_description,
    price_per_day: dto.price_per_day,
    price_per_hour: dto.price_per_hour,
    deposit_amount: dto.deposit_amount,
    pickup_location: dto.pickup_location, // откуда брать | надо??
    location: dto.pickup_location, // город
    status: dto.status,
    views_count: dto.views_count,
    created_at: dto.created_at,
    isAvailable: dto.is_available,
    dateAvailable:
      dto.nearest_available_date ?? new Date().toISOString().split("T")[0],
  };
}
