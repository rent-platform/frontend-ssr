export type PricingMode = "hour" | "day";

export type DealStatus =
  | "new"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "rejected";

export type ChangeSource = "user" | "system" | "payment_webhook" | "moderator";
