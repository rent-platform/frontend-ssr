import { baseApi } from "@/business/shared";
import type {
  CapturePaymentRequest,
  CreatePaymentRequest,
  Payment,
  PaymentConfirmationResponse,
} from "../types";

const PAYMENTS_LIST_TAG_ID = "LIST";

const getPaymentTags = (payment?: Payment) =>
  payment ? [{ type: "Payment" as const, id: payment.paymentId }] : [];

const getPaymentInvalidationTags = (paymentId?: string, dealId?: string) => [
  { type: "Payment" as const, id: PAYMENTS_LIST_TAG_ID },
  ...(dealId ? [{ type: "Payment" as const, id: `DEAL-${dealId}` }] : []),
  ...(paymentId ? [{ type: "Payment" as const, id: paymentId }] : []),
];

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createPayment: build.mutation<
      PaymentConfirmationResponse,
      CreatePaymentRequest
    >({
      query: ({ dealId }) => ({
        url: `api/deals/${dealId}/payment`,
        method: "POST",
      }),
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




