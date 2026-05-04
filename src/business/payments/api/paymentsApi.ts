import { baseApi } from "@/business/shared";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type {
  CapturePaymentRequest,
  CreatePaymentRequest,
  Deal as DealDto,
  Payment,
} from "../types";

const PAYMENTS_LIST_TAG_ID = "LIST";

const createCustomError = (message: string): FetchBaseQueryError => ({
  status: "CUSTOM_ERROR" as const,
  error: message,
});

const getPaymentTags = (payment?: Payment) =>
  payment ? [{ type: "Payment" as const, id: payment.paymentId }] : [];

const getPaymentInvalidationTags = (paymentId?: string, dealId?: string) => [
  { type: "Payment" as const, id: PAYMENTS_LIST_TAG_ID },
  ...(dealId ? [{ type: "Payment" as const, id: `DEAL-${dealId}` }] : []),
  ...(paymentId ? [{ type: "Payment" as const, id: paymentId }] : []),
];

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createPayment: build.mutation<Payment, CreatePaymentRequest>({
      async queryFn({ dealId }, _api, _extraOptions, baseQuery) {
        const dealResult = await baseQuery({
          url: `deals/${dealId}`,
        });

        if ("error" in dealResult && dealResult.error) {
          return { error: dealResult.error };
        }

        const deal = dealResult.data as DealDto;

        if (deal.status !== "confirmed") {
          return {
            error: createCustomError(
              "Нельзя оплатить сделку, пока она не подтверждена",
            ),
          };
        }

        const existingPaymentResult = await baseQuery({
          url: "payments",
          params: { dealId },
        });

        if ("data" in existingPaymentResult && existingPaymentResult.data) {
          const existingPayment = existingPaymentResult.data as Payment;

          if (
            existingPayment.status === "PENDING" ||
            existingPayment.status === "AUTHORIZED" ||
            existingPayment.status === "CAPTURED"
          ) {
            return {
              error: createCustomError("Нельзя оплатить сделку дважды"),
            };
          }
        }

        if (
          "error" in existingPaymentResult &&
          existingPaymentResult.error &&
          existingPaymentResult.error.status !== 404
        ) {
          return { error: existingPaymentResult.error };
        }

        const createPaymentResult = await baseQuery({
          url: "payments",
          method: "POST",
          body: { dealId },
        });

        if ("error" in createPaymentResult && createPaymentResult.error) {
          return { error: createPaymentResult.error };
        }

        return { data: createPaymentResult.data as Payment };
      },
      invalidatesTags: (result, _error, { dealId }) =>
        getPaymentInvalidationTags(result?.paymentId, dealId),
    }),

    capturePayment: build.mutation<
      Payment,
      { paymentId: string; body: CapturePaymentRequest; dealId?: string }
    >({
      query: ({ paymentId, body }) => ({
        url: `payments/${paymentId}/capture`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, _error, { paymentId, dealId }) =>
        getPaymentInvalidationTags(result?.paymentId ?? paymentId, dealId),
    }),

    cancelPayment: build.mutation<
      Payment,
      { paymentId: string; dealId?: string }
    >({
      query: ({ paymentId }) => ({
        url: `payments/${paymentId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: (result, _error, { paymentId, dealId }) =>
        getPaymentInvalidationTags(result?.paymentId ?? paymentId, dealId),
    }),

    fetchPaymentByDeal: build.query<Payment, string>({
      query: (dealId) => ({
        url: "payments",
        params: { dealId },
      }),
      providesTags: (result, _error, dealId) => [
        { type: "Payment", id: PAYMENTS_LIST_TAG_ID },
        { type: "Payment", id: `DEAL-${dealId}` },
        ...getPaymentTags(result),
      ],
    }),

    fetchPaymentById: build.query<Payment, string>({
      query: (paymentId) => ({
        url: `payments/${paymentId}`,
      }),
      providesTags: (result, _error, paymentId) => [
        { type: "Payment", id: paymentId },
        ...getPaymentTags(result),
      ],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useCapturePaymentMutation,
  useCancelPaymentMutation,
  useFetchPaymentByDealQuery,
  useFetchPaymentByIdQuery,
} = paymentsApi;




