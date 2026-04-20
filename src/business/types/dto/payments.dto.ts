export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED";

export interface Payment {
  paymentId: string;
  status: PaymentStatus;
  confirmationUrl?: string;
}

export interface CreatePaymentRequest {
  dealId: string;
}
