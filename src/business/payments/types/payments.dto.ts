export type PaymentStatus =
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "CANCELED"
  | "REFUNDED";

export interface Payment {
  paymentId: string;
  totalAmount: number;
  rentalAmount: number;
  depositAmount: number;
  status: PaymentStatus;
  confirmationUrl?: string;
}

export interface CreatePaymentRequest {
  dealId: string;
  rentalAmount: number;
  depositAmount: number;
}

export interface CapturePaymentRequest {
  amount: number;
}

