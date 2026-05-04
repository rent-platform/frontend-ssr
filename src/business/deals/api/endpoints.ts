import { baseApi } from "@/business/shared";
import type {
  CancelDealRequestDto,
  CreateDealRequestDto,
  Deal,
  DealsListResponseDto,
  DealStatusHistory,
  FetchDealsArgs,
  RejectDealRequestDto,
} from "../types";

const DEALS_URL = "api/deals";
const DEALS_LIST_TAG_ID = "LIST";
const INCOMING_DEALS_TAG_ID = "INCOMING";
const OUTGOING_DEALS_TAG_ID = "OUTGOING";

const emptyDealsPage = (): DealsListResponseDto => ({
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  size: 0,
  content: [],
  number: 0,
  numberOfElements: 0,
  empty: true,
});

const getDealTags = (deals?: Array<{ id: string }>) =>
  deals?.map((deal) => ({ type: "Deals" as const, id: deal.id })) ?? [];

const getDealHistoryTag = (dealId: string) => ({
  type: "Deals" as const,
  id: `HISTORY-${dealId}`,
});

function buildPageParams({
  status,
  page = 0,
  size = 20,
  sort,
}: FetchDealsArgs = {}): Record<string, string | string[]> {
  return {
    ...(status ? { status } : {}),
    page: String(page),
    size: String(size),
    ...(sort && sort.length > 0 ? { sort } : {}),
  };
}

function mergeDealsPages(
  renterPage?: DealsListResponseDto,
  ownerPage?: DealsListResponseDto,
): DealsListResponseDto {
  const renter = renterPage ?? emptyDealsPage();
  const owner = ownerPage ?? emptyDealsPage();
  const content = [...renter.content, ...owner.content];

  return {
    totalElements: renter.totalElements + owner.totalElements,
    totalPages: Math.max(renter.totalPages, owner.totalPages),
    first: renter.first && owner.first,
    last: renter.last && owner.last,
    size: renter.size + owner.size,
    content,
    number: Math.min(renter.number, owner.number),
    numberOfElements: content.length,
    empty: content.length === 0,
  };
}

const getDealMutationInvalidationTags = (dealId: string) => [
  { type: "Deals" as const, id: dealId },
  { type: "Deals" as const, id: DEALS_LIST_TAG_ID },
  { type: "Deals" as const, id: INCOMING_DEALS_TAG_ID },
  { type: "Deals" as const, id: OUTGOING_DEALS_TAG_ID },
  getDealHistoryTag(dealId),
];

export const dealsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchDeals: build.query<DealsListResponseDto, FetchDealsArgs | undefined>({
      async queryFn(params, _api, _extraOptions, baseQuery) {
        const queryParams = buildPageParams(params);
        const renterResult = await baseQuery({
          url: `${DEALS_URL}/my/renter`,
          params: queryParams,
        });
        const ownerResult = await baseQuery({
          url: `${DEALS_URL}/my/owner`,
          params: queryParams,
        });

        if ("error" in renterResult && renterResult.error) {
          return { error: renterResult.error };
        }
        if ("error" in ownerResult && ownerResult.error) {
          return { error: ownerResult.error };
        }

        return {
          data: mergeDealsPages(
            renterResult.data as DealsListResponseDto,
            ownerResult.data as DealsListResponseDto,
          ),
        };
      },
      providesTags: (result) => [
        { type: "Deals", id: DEALS_LIST_TAG_ID },
        ...getDealTags(result?.content),
      ],
    }),

    createDealRequest: build.mutation<Deal, CreateDealRequestDto>({
      query: (body) => ({
        url: DEALS_URL,
        method: "POST",
        body,
      }),
      invalidatesTags: (result) => [
        { type: "Deals", id: DEALS_LIST_TAG_ID },
        { type: "Deals", id: INCOMING_DEALS_TAG_ID },
        { type: "Deals", id: OUTGOING_DEALS_TAG_ID },
        ...(result ? [{ type: "Deals" as const, id: result.id }] : []),
      ],
    }),

    fetchDealById: build.query<Deal, string>({
      query: (id) => ({
        url: `${DEALS_URL}/${id}`,
      }),
      providesTags: (result, _error, id) => [
        { type: "Deals", id },
        ...(result?.history ? [getDealHistoryTag(id)] : []),
      ],
    }),

    confirmDeal: build.mutation<Deal, string>({
      query: (id) => ({
        url: `${DEALS_URL}/${id}/confirm`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) =>
        getDealMutationInvalidationTags(id),
    }),

    rejectDeal: build.mutation<
      Deal,
      { id: string; body: RejectDealRequestDto }
    >({
      query: ({ id, body }) => ({
        url: `${DEALS_URL}/${id}/reject`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) =>
        getDealMutationInvalidationTags(id),
    }),

    cancelDeal: build.mutation<
      Deal,
      { id: string; body: CancelDealRequestDto }
    >({
      query: ({ id, body }) => ({
        url: `${DEALS_URL}/${id}/cancel`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) =>
        getDealMutationInvalidationTags(id),
    }),

    startDeal: build.mutation<Deal, string>({
      query: (dealId) => ({
        url: `${DEALS_URL}/${dealId}/start`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) =>
        getDealMutationInvalidationTags(id),
    }),

    completeDeal: build.mutation<Deal, string>({
      query: (id) => ({
        url: `${DEALS_URL}/${id}/complete`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) =>
        getDealMutationInvalidationTags(id),
    }),

    fetchMyIncomingDeals: build.query<
      DealsListResponseDto,
      FetchDealsArgs | void
    >({
      query: (params) => ({
        url: `${DEALS_URL}/my/owner`,
        params: buildPageParams(params || undefined),
      }),
      providesTags: (result) => [
        { type: "Deals", id: INCOMING_DEALS_TAG_ID },
        ...getDealTags(result?.content),
      ],
    }),

    fetchMyOutgoingDeals: build.query<
      DealsListResponseDto,
      FetchDealsArgs | void
    >({
      query: (params) => ({
        url: `${DEALS_URL}/my/renter`,
        params: buildPageParams(params || undefined),
      }),
      providesTags: (result) => [
        { type: "Deals", id: OUTGOING_DEALS_TAG_ID },
        ...getDealTags(result?.content),
      ],
    }),

    fetchDealStatusHistory: build.query<DealStatusHistory[], string>({
      query: (id) => ({
        url: `${DEALS_URL}/${id}`,
      }),
      transformResponse: (response: Deal) => response.history ?? [],
      providesTags: (_result, _error, id) => [getDealHistoryTag(id)],
    }),
  }),
});

export const {
  useFetchDealsQuery,
  useCreateDealRequestMutation,
  useFetchDealByIdQuery,
  useConfirmDealMutation,
  useRejectDealMutation,
  useCancelDealMutation,
  useStartDealMutation,
  useCompleteDealMutation,
  useFetchMyIncomingDealsQuery,
  useFetchMyOutgoingDealsQuery,
  useFetchDealStatusHistoryQuery,
} = dealsApi;
