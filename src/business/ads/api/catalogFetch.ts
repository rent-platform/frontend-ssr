import { mapCatalogShortItemToCardVM } from "../mappers";
import type { AdsListResponseDto, CatalogListVM, FetchAdsArgs } from "../types";

const CATALOG_ITEMS_PATH = "api/catalog/items";

type QueryParamValue = string | number | undefined;

export type CatalogPageHydrationPayload = {
  queryArg: FetchAdsArgs;
  pageParam: number;
  page: AdsListResponseDto;
  view: CatalogListVM;
};

function getBackendBaseUrl(): string {
  const baseUrl = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("Backend API URL is not configured");
  }

  return baseUrl.replace(/\/+$/, "");
}

function buildCatalogItemsSearchParams(args: FetchAdsArgs): URLSearchParams {
  const rawParams: Record<string, QueryParamValue> = {
    categoryId: args.categoryId,
    city: args.city,
    query: args.search,
    minPricePerDay: args.priceFrom,
    maxPricePerDay: args.priceTo,
    minPricePerHour: args.minPricePerHour,
    maxPricePerHour: args.maxPricePerHour,
    status: args.status,
    page: args.pageNumber ?? 0,
    size: args.pageSize ?? 20,
    sortBy: args.sortBy ?? "createdAt",
    sortDirection: args.sortDirection ?? "desc",
  };

  const searchParams = new URLSearchParams();

  Object.entries(rawParams).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    searchParams.set(key, String(value));
  });

  return searchParams;
}

function normalizeCatalogQueryArg(args: FetchAdsArgs = {}): FetchAdsArgs {
  return {
    ...args,
    pageNumber: undefined,
    pageSize: args.pageSize ?? 20,
  };
}

function mapCatalogPageToVM(data: AdsListResponseDto): CatalogListVM {
  return {
    items: data.content.map(mapCatalogShortItemToCardVM),
    total: data.totalElements,
  };
}

async function fetchCatalogPageDto(
  args: FetchAdsArgs = {},
): Promise<AdsListResponseDto> {
  const url = new URL(CATALOG_ITEMS_PATH, `${getBackendBaseUrl()}/`);
  url.search = buildCatalogItemsSearchParams(args).toString();

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed with status ${response.status}`);
  }

  return (await response.json()) as AdsListResponseDto;
}

export async function fetchCatalogPage(
  args: FetchAdsArgs = {},
): Promise<CatalogListVM> {
  const data = await fetchCatalogPageDto(args);

  return mapCatalogPageToVM(data);
}

export async function fetchCatalogPageForHydration(
  args: FetchAdsArgs = {},
): Promise<CatalogPageHydrationPayload> {
  const queryArg = normalizeCatalogQueryArg(args);
  const pageParam = args.pageNumber ?? 0;
  const page = await fetchCatalogPageDto({
    ...queryArg,
    pageNumber: pageParam,
  });

  return {
    queryArg,
    pageParam,
    page,
    view: mapCatalogPageToVM(page),
  };
}
