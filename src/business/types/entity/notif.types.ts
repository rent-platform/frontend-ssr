// ─── Enums / Union types ────────────────────────────────────────────────────

export type NotificationType =
  | 'new_deal'
  | 'deal_status_changed'
  | 'new_message'
  | 'review_received'
  | 'payment_status';

export type PushTokenPlatform = 'ios' | 'android' | 'web';

// ─── Table: notifications ─────────────────────────────────────────────────────

export type Notification = {
  id: string;                                   // UUID PK
  user_id: string;                              // UUID NOT NULL (ref User Service)
  type: NotificationType;                       // VARCHAR(50) NOT NULL
  title: string;                                // VARCHAR(255) NOT NULL
  body: string;                                 // TEXT NOT NULL
  /** JSONB — дополнительные данные: deal_id, item_id и т.д. */
  data: Record<string, unknown> | null;
  read_at: string | null;                       // TIMESTAMPTZ
  created_at: string;                           // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};

// ─── Table: push_tokens ───────────────────────────────────────────────────────

export type PushToken = {
  id: string;                    // UUID PK
  user_id: string;               // UUID NOT NULL (ref User Service)
  token: string;                 // TEXT NOT NULL UNIQUE (FCM token)
  device_id: string | null;      // VARCHAR(100)
  device_name: string | null;    // VARCHAR(100)
  platform: PushTokenPlatform;   // VARCHAR(20) NOT NULL
  is_active: boolean;            // BOOLEAN NOT NULL DEFAULT TRUE
  created_at: string;            // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at: string;            // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};

// ─── Table: notification_settings ────────────────────────────────────────────

export type NotificationSettings = {
  user_id: string;               // UUID PK (ref User Service)
  new_deal: boolean;             // BOOLEAN NOT NULL DEFAULT TRUE
  deal_status_changed: boolean;  // BOOLEAN NOT NULL DEFAULT TRUE
  new_message: boolean;          // BOOLEAN NOT NULL DEFAULT TRUE
  review_received: boolean;      // BOOLEAN NOT NULL DEFAULT TRUE
  payment_status: boolean;       // BOOLEAN NOT NULL DEFAULT TRUE
  updated_at: string;            // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};

