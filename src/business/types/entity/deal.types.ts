// ─── Enums / Union types ────────────────────────────────────────────────────

export type PricingMode = "hour" | "day";

export type DealStatus =
  | "new"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "rejected";

export type TransactionType =
  | "rental"
  | "deposit_hold"
  | "deposit_release"
  | "penalty";

export type TransactionStatus =
  | "pending"
  | "held"
  | "captured"
  | "refunded"
  | "failed"
  | "cancelled";

export type ChangeSource = "user" | "system" | "payment_webhook" | "moderator";

// ─── Table: deals ─────────────────────────────────────────────────────────────

export type Deal = {
  id: string; // UUID PK
  item_id: string; // UUID NOT NULL (ref Catalog Service)
  renter_id: string; // UUID NOT NULL (ref User Service)
  owner_id: string; // UUID NOT NULL (ref User Service)
  start_date: string; // TIMESTAMPTZ NOT NULL
  end_date: string; // TIMESTAMPTZ NOT NULL
  pricing_mode: PricingMode; // VARCHAR(10) NOT NULL
  /** DECIMAL(10,2) — только при pricing_mode='day' */
  price_per_day_snapshot: string | null;
  /** DECIMAL(10,2) — только при pricing_mode='hour' */
  price_per_hour_snapshot: string | null;
  /** DECIMAL(10,2) NOT NULL */
  total_price: string;
  /** DECIMAL(10,2) NOT NULL DEFAULT 0 */
  deposit_amount: string;
  status: DealStatus; // VARCHAR(20) NOT NULL DEFAULT 'new'
  rejection_reason: string | null; // TEXT
  created_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};
export type dealsQueryParams = {
  page?: number;
  limit?: number;
  search?: string; // TODO: возможно на сорт поменять
};

export type dealsList = {
  deals: Deal[];
};

// ─── Table: deal_comments ─────────────────────────────────────────────────────

export type DealComment = {
  id: string; // UUID PK
  deal_id: string; // UUID NOT NULL FK → deals(id) ON DELETE CASCADE
  author_id: string; // UUID NOT NULL (ref User Service)
  text: string; // TEXT NOT NULL
  created_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};

// ─── Table: transactions ──────────────────────────────────────────────────────

export type Transaction = {
  id: string; // UUID PK
  deal_id: string; // UUID NOT NULL FK → deals(id) ON DELETE CASCADE
  type: TransactionType; // VARCHAR(20) NOT NULL
  /** DECIMAL(10,2) NOT NULL */
  amount: string;
  status: TransactionStatus; // VARCHAR(20) NOT NULL DEFAULT 'pending'
  yookassa_payment_id: string | null; // VARCHAR(100)
  yookassa_payment_method_id: string | null; // VARCHAR(100)
  gateway_response: Record<string, unknown> | null; // JSONB
  created_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};

// ─── Table: deal_status_history ───────────────────────────────────────────────

export type DealStatusHistory = {
  id: string; // UUID PK
  deal_id: string; // UUID NOT NULL FK → deals(id) ON DELETE CASCADE
  old_status: DealStatus | null; // VARCHAR(20)
  new_status: DealStatus; // VARCHAR(20) NOT NULL
  changed_by: string | null; // UUID (ref User Service)
  change_source: ChangeSource; // VARCHAR(20) NOT NULL
  comment: string | null; // TEXT
  changed_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};
