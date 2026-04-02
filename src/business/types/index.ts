// ─── User domain ─────────────────────────────────────────────────────────────
export type { User, Session, UserBillingProfile, UserRole } from './entity/user.types';

// ─── Catalog domain ───────────────────────────────────────────────────────────
export type {
  Category,
  Item,
  Photo,
  Availability,
  ItemStatus,
} from './entity/catalog.types';

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
} from './entity/deal.types';

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
} from './entity/comm.types';

// ─── Notifications domain ─────────────────────────────────────────────────────
export type {
  Notification,
  PushToken,
  NotificationSettings,
  NotificationType,
  PushTokenPlatform,
} from './entity/notif.types';
