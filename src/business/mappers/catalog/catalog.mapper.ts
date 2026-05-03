import type {
  AdsItemResponseDto,
  CatalogItemBaseVM,
  CatalogItemCardVM,
  CatalogItemDetailsVM,
} from "@/business/types";

function getSortedPhotoUrls(dto: AdsItemResponseDto): string[] {
  return [...(dto.photos ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order) // Сортировка по порядку
    .map((photo) => photo.photo_url); // Для UI остается только URL изображения.
}
function mapCatalogItemToBaseVM(dto: AdsItemResponseDto): CatalogItemBaseVM {
  return {
    // Базовая view model содержит общие поля карточки и деталей.
    id: dto.id, // Идентификатор объявления сохраняется без изменения.
    title: dto.title, // Название объявления передается в UI.
    pricePerDay: dto.price_per_day, // price_per_day приводится к camelCase.
    pricePerHour: dto.price_per_hour, // price_per_hour приводится к camelCase.
    depositAmount: dto.deposit_amount, // deposit_amount приводится к camelCase.
    pickupLocation: dto.pickup_location, // pickup_location приводится к camelCase.
    status: dto.status, // Статус объявления берется из DTO.
    viewsCount: dto.views_count, // views_count приводится к camelCase.
    createdAt: dto.created_at, // created_at приводится к camelCase.
    isAvailable: dto.is_available, // is_available приводится к camelCase.
    nearestAvailableDate: dto.nearest_available_date, // Дата доступности для UI.
  };
}

export function mapCatalogItemToCardVM(
  dto: AdsItemResponseDto,
): CatalogItemCardVM {
  const photoUrls = getSortedPhotoUrls(dto); // Подготовленный список URL фото.

  return {
    // View model для карточки каталога.
    ...mapCatalogItemToBaseVM(dto), // Общие поля объявления.
    coverImageUrl: photoUrls[0] ?? null, // Первое фото используется как обложка.
  };
}

export function mapCatalogItemToDetailsVM(
  dto: AdsItemResponseDto,
): CatalogItemDetailsVM {
  return {
    // View model для детальной страницы объявления.
    ...mapCatalogItemToBaseVM(dto), // Общие поля объявления.
    description: dto.item_description, // item_description приводится к description.
    photos: getSortedPhotoUrls(dto), // Детальная страница получает все фото.
  };
}
