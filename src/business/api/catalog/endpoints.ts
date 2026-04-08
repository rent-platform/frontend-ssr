import { baseApi } from "@/business/api/baseApi";
import type {
  CatalogListResponseDto,
  CatalogQueryParams,
  CatalogItemResponseDto,
} from "@/business/types/dto/catalog.dto";

export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchCatalog: build.query<CatalogListResponseDto, CatalogQueryParams>({
      query: ({ page = 1, limit = 10, category_id, search } = {}) => ({
        url: "/catalog",
        params: {
          page,
          limit,
          ...(category_id !== undefined && { category_id }),
          ...(search !== undefined && { search }),
        }, // TODO: пагинацию на infinite query
      }),
      providesTags: ["Catalog"],
    }),

    fetchCatalogItem: build.query<CatalogItemResponseDto, string>({
      query: (id) => ({ url: `/catalog/${id}` }),
      providesTags: (_result, _err, id) => [{ type: "CatalogItem", id }],
    }),
  }),
  overrideExisting: false,
});

export const { useFetchCatalogQuery, useFetchCatalogItemQuery } = catalogApi;
