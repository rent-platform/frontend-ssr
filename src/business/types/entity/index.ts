// ─── User domain ─────────────────────────────────────────────────────────────
export type {
  UserUpdate,
  Session,
  UserBillingProfile,
  UserRole,
} from "./user.types";

// ─── Catalog domain ───────────────────────────────────────────────────────────
export type {
  Category,
  ItemWithPhotos,
  Photo,
  Availability,
  ItemStatus,
} from "./catalog.types";

// ─── Deal domain ──────────────────────────────────────────────────────────────
export type {
  Deal,
  DealComment,
  Transaction,
  DealStatusHistory,
  PricingMode,
  DealStatus,
  TransactionType,
  TransactionStatus,
  ChangeSource,
} from "./deal.types";

// ─── Communications domain ────────────────────────────────────────────────────
export type {
  Chat,
  ChatParticipant,
  Message,
  MessageRead,
  Review,
  Complaint,
  ComplaintTargetType,
  ComplaintStatus,
} from "./comm.types";

// ─── Notifications domain ─────────────────────────────────────────────────────
export type {
  Notification,
  PushToken,
  NotificationSettings,
  NotificationType,
  PushTokenPlatform,
} from "./notif.types";
