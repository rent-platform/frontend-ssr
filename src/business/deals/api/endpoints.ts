import { baseApi } from "@/business/shared";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type {
  CreateDealRequestDto,
  Deal,
  DealStatusHistory,
  DealsListResponseDto,
  FetchDealsArgs,
  Payment,
  RejectDealRequestDto,
} from "../types";

const DEALS_LIST_TAG_ID = "LIST";
const INCOMING_DEALS_TAG_ID = "INCOMING";
const OUTGOING_DEALS_TAG_ID = "OUTGOING";

const getDealTags = (deals?: Deal[]) =>
  deals?.map((deal) => ({ type: "Deals" as const, id: deal.id })) ?? [];

const getDealHistoryTag = (dealId: string) => ({
  type: "Deals" as const,
  id: `HISTORY-${dealId}`,
});

const getDealsListQuery = ({
  page = 1,
  limit = 10,
  search,
}: FetchDealsArgs = {}) => ({
  url: "deals",
  params: {
    page,
    limit,
    ...(search !== undefined && { search }),
  },
});

const getDealMutationInvalidationTags = (dealId: string) => [
  { type: "Deals" as const, id: dealId },
  { type: "Deals" as const, id: DEALS_LIST_TAG_ID },
  { type: "Deals" as const, id: INCOMING_DEALS_TAG_ID },
  { type: "Deals" as const, id: OUTGOING_DEALS_TAG_ID },
  getDealHistoryTag(dealId),
];

const createCustomError = (message: string): FetchBaseQueryError => ({
  status: "CUSTOM_ERROR" as const,
  error: message,
});

export const dealsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchDeals: build.query<DealsListResponseDto, FetchDealsArgs | undefined>({
      query: (params) => getDealsListQuery(params),
      providesTags: (result) => [
        { type: "Deals", id: DEALS_LIST_TAG_ID },
        ...getDealTags(result?.deals),
      ],
    }),

    createDealRequest: build.mutation<Deal, CreateDealRequestDto>({
      query: (body) => ({
        url: "deals",
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
        url: `deals/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: "Deals", id }],
    }),

    confirmDeal: build.mutation<Deal, string>({
      query: (id) => ({
        url: `deals/${id}/confirm`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) =>
        getDealMutationInvalidationTags(id),
    }),

    rejectDeal: build.mutation<
      Deal,
      { id: string; body?: RejectDealRequestDto }
    >({
      query: ({ id, body }) => ({
        url: `deals/${id}/reject`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) =>
        getDealMutationInvalidationTags(id),
    }),

    cancelDeal: build.mutation<Deal, string>({
      query: (id) => ({
        url: `deals/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) =>
        getDealMutationInvalidationTags(id),
    }),

    startDeal: build.mutation<Deal, string>({
      async queryFn(dealId, _api, _extraOptions, baseQuery) {
        const paymentResult = await baseQuery({
          url: "payments",
          params: { dealId },
        });
        if ("error" in paymentResult) {
          return {
            error: createCustomError(
              "Нельзя начать сделку без подтвержденной оплаты",
            ),
          };
        }
        const payment = paymentResult.data as Payment;
        if (payment.status !== "AUTHORIZED" && payment.status !== "CAPTURED") {
          return {
            error: createCustomError(
              "Нельзя начать сделку без подтвержденной оплаты",
            ),
          };
        }
        const startDealResult = await baseQuery({
          url: `deals/${dealId}/start`,
          method: "PATCH",
        });
        if ("error" in startDealResult && startDealResult.error) {
          return { error: startDealResult.error };
        }

        return { data: startDealResult.data as Deal };
      },
      invalidatesTags: (_result, _error, id) =>
        getDealMutationInvalidationTags(id),
    }),

    completeDeal: build.mutation<Deal, string>({
      query: (id) => ({
        url: `deals/${id}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) =>
        getDealMutationInvalidationTags(id),
    }),

    fetchMyIncomingDeals: build.query<DealsListResponseDto, void>({
      query: () => ({
        url: "deals",
        params: {
          type: "incoming",
        },
      }),
      providesTags: (result) => [
        { type: "Deals", id: INCOMING_DEALS_TAG_ID },
        ...getDealTags(result?.deals),
      ],
    }),

    fetchMyOutgoingDeals: build.query<DealsListResponseDto, void>({
      query: () => ({
        url: "deals",
        params: {
          type: "outgoing",
        },
      }),
      providesTags: (result) => [
        { type: "Deals", id: OUTGOING_DEALS_TAG_ID },
        ...getDealTags(result?.deals),
      ],
    }),

    fetchDealStatusHistory: build.query<DealStatusHistory[], string>({
      query: (id) => ({
        url: `deals/${id}/history`,
      }),
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




