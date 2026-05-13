export type PaymentUiStatus =
  | 'pending'
  | 'processing'
  | 'authorized'
  | 'captured'
  | 'canceled'
  | 'refunded'
  | 'error';

export type PaymentUiColor = 'warning' | 'info' | 'success' | 'danger' | 'neutral';

export interface PaymentUiState {
  status: PaymentUiStatus;
  label: string;
  description: string;
  icon: string;
  color: PaymentUiColor;
  canRetry: boolean;
  canCancel: boolean;
}

export interface PaymentPageProps {
  dealId: string;
}
