// deals/comments/transactions/status history.

import { baseApi } from "@/business/api/baseApi";
import {
  dealsList,
  dealsQueryParams,
} from "@/business/types/entity/deal.types";

export const endpoints = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchDeals: build.query<dealsList, dealsQueryParams>({
      query: ({ page = 1, limit = 10, search } = {}) => ({
        url: "/deals",
        params: {
          page,
          limit,
          ...(search !== undefined && { search }),
        },
      }),
    }),
  }),
});

export const { useFetchDealsQuery } = endpoints;
