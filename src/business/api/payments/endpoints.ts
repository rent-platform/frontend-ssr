import { baseApi } from "@/business/api/baseApi";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type {
  CreatePaymentRequest,
  Payment,
} from "@/business/types/dto/payments.dto";
import type { Deal } from "@/business/types/entity/deal.types";

const PAYMENTS_LIST_TAG_ID = "LIST";

const createCustomError = (message: string): FetchBaseQueryError => ({
  status: "CUSTOM_ERROR" as const,
  error: message,
});

const getPaymentTags = (payment?: Payment) =>
  payment ? [{ type: "Payment" as const, id: payment.paymentId }] : [];

export const endpoints = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createPayment: build.mutation<Payment, CreatePaymentRequest>({
      async queryFn({ dealId }, _api, _extraOptions, baseQuery) {
        const dealResult = await baseQuery({
          url: `deals/${dealId}`,
        });

        if ("error" in dealResult && dealResult.error) {
          return { error: dealResult.error };
        }

        const deal = dealResult.data as Deal;

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
            existingPayment.status === "SUCCEEDED"
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
      invalidatesTags: (_result, _error, { dealId }) => [
        { type: "Payment", id: PAYMENTS_LIST_TAG_ID },
        { type: "Payment", id: `DEAL-${dealId}` },
      ],
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
  useFetchPaymentByDealQuery,
  useFetchPaymentByIdQuery,
} = endpoints;
