// ─── Enums / Union types ────────────────────────────────────────────────────

export type UserRole = 'user' | 'moderator' | 'admin';

// ─── Table: users ────────────────────────────────────────────────────────────

export type User = {
  id: string;                        // UUID PK
  email: string | null;              // VARCHAR(255)
  phone: string;                     // VARCHAR(20) NOT NULL
  password_hash: string;             // VARCHAR(255) NOT NULL
  full_name: string;                 // VARCHAR(100) NOT NULL
  nickname: string | null;           // VARCHAR(50)
  avatar_url: string | null;         // TEXT
  bio: string | null;                // TEXT
  role: UserRole;                    // VARCHAR(20) NOT NULL DEFAULT 'user'
  email_verified_at: string | null;  // TIMESTAMPTZ
  phone_verified_at: string | null;  // TIMESTAMPTZ
  is_active: boolean;                // BOOLEAN NOT NULL DEFAULT TRUE
  last_login_at: string | null;      // TIMESTAMPTZ
  created_at: string;                // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at: string;                // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  deleted_at: string | null;         // TIMESTAMPTZ (soft delete)
};

// ─── Table: sessions ─────────────────────────────────────────────────────────

export type Session = {
  id: string;                        // UUID PK
  user_id: string;                   // UUID NOT NULL FK → users(id)
  refresh_token_hash: string;        // TEXT NOT NULL
  device_info: string | null;        // TEXT
  expires_at: string;                // TIMESTAMPTZ NOT NULL
  revoked_at: string | null;         // TIMESTAMPTZ
  created_at: string;                // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};

// ─── Table: user_billing_profiles ────────────────────────────────────────────

export type UserBillingProfile = {
  id: string;                                  // UUID PK
  user_id: string;                             // UUID NOT NULL UNIQUE FK → users(id)
  customer_id: string | null;                  // VARCHAR(100)
  default_payment_method_id: string | null;    // VARCHAR(100)
  created_at: string;                          // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at: string;                          // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};

