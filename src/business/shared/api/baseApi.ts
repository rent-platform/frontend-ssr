import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Общий API-слой приложения на базе RTK Query.
export const baseApi = createApi({
  reducerPath: "api", // Имя раздела RTK Query в Redux store.
  // Базовая настройка HTTP-запросов.
  baseQuery: fetchBaseQuery({
    // Клиент не читает accessToken: все запросы идут через BFF-прокси.
    baseUrl: "/api/proxy",
    credentials: "same-origin",
  }),
  // Типы тегов для кэширования и инвалидации данных.
  tagTypes: [
    "Ads",
    "AdsItem",
    "Session",
    "Users",
    "Deals",
    "Notifications",
    "Favorites",
    "Review",
    "UserRating",
    "Payment",
  ],
  refetchOnReconnect: true, // Повторная загрузка данных при восстановлении соединения.
  endpoints: () => ({}),
});


