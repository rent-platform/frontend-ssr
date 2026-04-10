import type { AdsItemResponseDto } from "@/business/types/dto/ads.dto";

export const MOCK_CATALOG_ITEMS: AdsItemResponseDto[] = [
  {
    id: "cat-item-1",
    owner_id: "mock-user-1",
    title: "Перфоратор Bosch GBH 2-26",
    item_description:
      "Профессиональный перфоратор. Мощность 800 Вт, SDS-Plus. Идеален для бурения бетона до 26 мм.",
    price_per_day: "500.00",
    price_per_hour: "80.00",
    deposit_amount: "3000.00",
    pickup_location: "Москва, Таганская",
    status: "active",
    views_count: 142,
    created_at: "2024-11-01T10:00:00.000Z",
    photos: [
      {
        photo_url: "https://placehold.co/400x300?text=Bosch+GBH",
        sort_order: 0,
      },
    ],
    is_available: true,
    nearest_available_date: "2024-12-20",
  },
  {
    id: "cat-item-2",
    owner_id: "mock-user-2",
    title: "Велосипед горный Trek Marlin 5",
    item_description:
      "29-дюймовый алюминиевый горный велосипед. 21 скорость, дисковые тормоза.",
    price_per_day: "800.00",
    price_per_hour: null,
    deposit_amount: "5000.00",
    pickup_location: "Москва, Воробьёвы горы",
    status: "active",
    views_count: 278,
    created_at: "2024-10-15T08:30:00.000Z",
    photos: [
      {
        photo_url: "https://placehold.co/400x300?text=Trek+Marlin",
        sort_order: 0,
      },
      {
        photo_url: "https://placehold.co/400x300?text=Trek+Side",
        sort_order: 1,
      },
    ],
    is_available: true,
    nearest_available_date: "2024-12-21",
  },
  {
    id: "cat-item-3",
    owner_id: "mock-user-1",
    title: "Палатка туристическая 4-местная",
    item_description:
      "Лёгкая туристическая палатка. Водостойкость 3000 мм. Вес 2.8 кг.",
    price_per_day: "350.00",
    price_per_hour: null,
    deposit_amount: "2000.00",
    pickup_location: "Москва, Академическая",
    status: "active",
    views_count: 95,
    created_at: "2024-09-20T14:15:00.000Z",
    photos: [
      { photo_url: "https://placehold.co/400x300?text=Палатка", sort_order: 0 },
    ],
    is_available: false,
    nearest_available_date: "2024-12-28",
  },
  {
    id: "cat-item-4",
    owner_id: "mock-user-2",
    title: "Проектор Epson EB-X41",
    item_description:
      "Проектор для презентаций и кино. 3600 люмен, HDMI/VGA. Идеален для офиса и дома.",
    price_per_day: "1200.00",
    price_per_hour: "200.00",
    deposit_amount: "8000.00",
    pickup_location: "Москва, Павелецкая",
    status: "active",
    views_count: 56,
    created_at: "2024-12-01T12:00:00.000Z",
    photos: [
      {
        photo_url: "https://placehold.co/400x300?text=Epson+EB",
        sort_order: 0,
      },
    ],
    is_available: true,
    nearest_available_date: "2024-12-20",
  },
  {
    id: "cat-item-5",
    owner_id: "mock-user-1",
    title: "Лодка надувная ПВХ 2-местная",
    item_description:
      "Надувная лодка ПВХ с алюминиевыми вёслами. Грузоподъёмность 200 кг.",
    price_per_day: "1500.00",
    price_per_hour: null,
    deposit_amount: "10000.00",
    pickup_location: "Москва, Речной вокзал",
    status: "active",
    views_count: 189,
    created_at: "2024-08-10T09:00:00.000Z",
    photos: [
      {
        photo_url: "https://placehold.co/400x300?text=Лодка+ПВХ",
        sort_order: 0,
      },
    ],
    is_available: true,
    nearest_available_date: "2024-12-22",
  },
];
