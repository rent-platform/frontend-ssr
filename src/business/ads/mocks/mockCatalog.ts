import type { AdsItemResponseDto } from "../types";

export const MOCK_CATALOG_ITEMS: AdsItemResponseDto[] = [
  {
    id: "cat-item-1",
    ownerId: "mock-user-1",
    title: "Перфоратор Bosch GBH 2-26",
    itemDescription:
      "Профессиональный перфоратор. Мощность 800 Вт, SDS-Plus. Идеален для бурения бетона до 26 мм.",
    pricePerDay: 500,
    pricePerHour: 80,
    depositAmount: 3000,
    city: "Москва",
    pickupLocation: "Москва, Таганская",
    status: "ACTIVE",
    viewsCount: 142,
    createdAt: "2024-11-01T10:00:00.000Z",
    photos: [
      {
        photoUrl: "https://placehold.co/400x300?text=Bosch+GBH",
        sortOrder: 0,
      },
    ],
    isAvailable: true,
    nearestAvailableDate: "2024-12-20",
  },
  {
    id: "cat-item-2",
    ownerId: "mock-user-2",
    title: "Велосипед горный Trek Marlin 5",
    itemDescription:
      "29-дюймовый алюминиевый горный велосипед. 21 скорость, дисковые тормоза.",
    pricePerDay: 800,
    pricePerHour: null,
    depositAmount: 5000,
    city: "Москва",
    pickupLocation: "Москва, Воробьёвы горы",
    status: "ACTIVE",
    viewsCount: 278,
    createdAt: "2024-10-15T08:30:00.000Z",
    photos: [
      {
        photoUrl: "https://placehold.co/400x300?text=Trek+Marlin",
        sortOrder: 0,
      },
      {
        photoUrl: "https://placehold.co/400x300?text=Trek+Side",
        sortOrder: 1,
      },
    ],
    isAvailable: true,
    nearestAvailableDate: "2024-12-21",
  },
  {
    id: "cat-item-3",
    ownerId: "mock-user-1",
    title: "Палатка туристическая 4-местная",
    itemDescription:
      "Лёгкая туристическая палатка. Водостойкость 3000 мм. Вес 2.8 кг.",
    pricePerDay: 350,
    pricePerHour: null,
    depositAmount: 2000,
    city: "Москва",
    pickupLocation: "Москва, Академическая",
    status: "ACTIVE",
    viewsCount: 95,
    createdAt: "2024-09-20T14:15:00.000Z",
    photos: [
      { photoUrl: "https://placehold.co/400x300?text=Палатка", sortOrder: 0 },
    ],
    isAvailable: false,
    nearestAvailableDate: "2024-12-28",
  },
  {
    id: "cat-item-4",
    ownerId: "mock-user-2",
    title: "Проектор Epson EB-X41",
    itemDescription:
      "Проектор для презентаций и кино. 3600 люмен, HDMI/VGA. Идеален для офиса и дома.",
    pricePerDay: 1200,
    pricePerHour: 200,
    depositAmount: 8000,
    city: "Москва",
    pickupLocation: "Москва, Павелецкая",
    status: "ACTIVE",
    viewsCount: 56,
    createdAt: "2024-12-01T12:00:00.000Z",
    photos: [
      {
        photoUrl: "https://placehold.co/400x300?text=Epson+EB",
        sortOrder: 0,
      },
    ],
    isAvailable: true,
    nearestAvailableDate: "2024-12-20",
  },
  {
    id: "cat-item-5",
    ownerId: "mock-user-1",
    title: "Лодка надувная ПВХ 2-местная",
    itemDescription:
      "Надувная лодка ПВХ с алюминиевыми вёслами. Грузоподъёмность 200 кг.",
    pricePerDay: 1500,
    pricePerHour: null,
    depositAmount: 10000,
    city: "Москва",
    pickupLocation: "Москва, Речной вокзал",
    status: "ACTIVE",
    viewsCount: 189,
    createdAt: "2024-08-10T09:00:00.000Z",
    photos: [
      {
        photoUrl: "https://placehold.co/400x300?text=Лодка+ПВХ",
        sortOrder: 0,
      },
    ],
    isAvailable: true,
    nearestAvailableDate: "2024-12-22",
  },
];
