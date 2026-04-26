import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "/api",
    prepareHeaders: async (headers) => {
      const session = await getSession();
      if (session?.accessToken) {
        headers.set("Authorization", `Bearer ${session.accessToken}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Ads",
    "AdsItem",
    "Session",
    "Users",
    "Deals",
    "Notifications",
    "Review",
    "UserRating",
    "Payment",
  ],
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
