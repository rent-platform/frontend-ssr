// ─── Enums / Union types ────────────────────────────────────────────────────

export type ComplaintTargetType = 'user' | 'item' | 'review';

export type ComplaintStatus = 'new' | 'in_progress' | 'resolved' | 'rejected';

// ─── Table: chats ─────────────────────────────────────────────────────────────
// Constraint: item_id IS NOT NULL OR deal_id IS NOT NULL

export type Chat = {
  id: string;              // UUID PK
  item_id: string | null;  // UUID (ref Catalog Service)
  deal_id: string | null;  // UUID (ref Deal Service)
  created_at: string;      // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at: string;      // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};

// ─── Table: chat_participants ─────────────────────────────────────────────────

export type ChatParticipant = {
  chat_id: string; // UUID NOT NULL FK → chats(id) ON DELETE CASCADE (PK part)
  user_id: string; // UUID NOT NULL (ref User Service) (PK part)
};

// ─── Table: messages ──────────────────────────────────────────────────────────

export type Message = {
  id: string;         // UUID PK
  chat_id: string;    // UUID NOT NULL FK → chats(id) ON DELETE CASCADE
  sender_id: string;  // UUID NOT NULL (ref User Service)
  text: string;       // TEXT NOT NULL
  created_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};

// ─── Table: message_reads ─────────────────────────────────────────────────────

export type MessageRead = {
  message_id: string; // UUID NOT NULL FK → messages(id) ON DELETE CASCADE (PK part)
  user_id: string;    // UUID NOT NULL (ref User Service) (PK part)
  read_at: string;    // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};

// ─── Table: reviews ───────────────────────────────────────────────────────────

export type Review = {
  id: string;           // UUID PK
  deal_id: string;      // UUID NOT NULL (ref Deal Service)
  from_user_id: string; // UUID NOT NULL (ref User Service)
  to_user_id: string;   // UUID NOT NULL (ref User Service)
  /** INT NOT NULL CHECK (rating BETWEEN 1 AND 5) */
  rating: 1 | 2 | 3 | 4 | 5;
  text: string | null;  // TEXT
  created_at: string;   // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at: string;   // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};

// ─── Table: complaints ────────────────────────────────────────────────────────

export type Complaint = {
  id: string;                          // UUID PK
  complainant_id: string;              // UUID NOT NULL (ref User Service)
  target_type: ComplaintTargetType;    // VARCHAR(20) NOT NULL
  target_id: string;                   // UUID NOT NULL
  reason: string;                      // VARCHAR(100) NOT NULL
  description: string | null;          // TEXT
  status: ComplaintStatus;             // VARCHAR(20) NOT NULL DEFAULT 'new'
  moderator_comment: string | null;    // TEXT
  created_at: string;                  // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  resolved_at: string | null;          // TIMESTAMPTZ
};

