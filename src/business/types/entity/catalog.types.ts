// ─── Enums / Union types ────────────────────────────────────────────────────

export type ItemStatus =
  | "draft"
  | "moderation"
  | "active"
  | "rejected"
  | "archived";

// ─── Table: categories ───────────────────────────────────────────────────────

export type Category = {
  id: number; // BIGSERIAL PK
  category_name: string; // VARCHAR(100) NOT NULL
  slug: string; // VARCHAR(120) NOT NULL
  parent_id: number | null; // BIGINT FK → categories(id) ON DELETE SET NULL
  sort_order: number; // INT NOT NULL DEFAULT 0
  is_active: boolean; // BOOLEAN NOT NULL DEFAULT TRUE
  created_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  deleted_at: string | null; // TIMESTAMPTZ (soft delete)
};

// ─── Table: items ─────────────────────────────────────────────────────────────
export type Item = {
  id: string; // UUID PK
  owner_id: string; // UUID NOT NULL (ref User Service)
  category_id: number | null; // BIGINT FK → categories(id)
  title: string; // VARCHAR(200) NOT NULL
  item_description: string | null; // TEXT

  price_per_day:
    | string
    | null; /** DECIMAL(10,2) — хранится строкой во избежание float-ошибок */
  price_per_hour: string | null; /** DECIMAL(10,2) — хранится строкой */

  deposit_amount: string; /** DECIMAL(10,2) NOT NULL DEFAULT 0 */
  pickup_location: string | null; // TEXT
  status: ItemStatus; // VARCHAR(20) NOT NULL DEFAULT 'draft'
  moderation_comment: string | null; // TEXT
  views_count: number; // INT NOT NULL DEFAULT 0
  created_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  updated_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
  deleted_at: string | null; // TIMESTAMPTZ (soft delete)
};

// ─── Table: photos ────────────────────────────────────────────────────────────

export type Photo = {
  id: string; // UUID PK
  item_id: string; // UUID NOT NULL FK → items(id) ON DELETE CASCADE
  photo_url: string; // TEXT NOT NULL
  sort_order: number; // INT NOT NULL DEFAULT 0
  created_at: string; // TIMESTAMPTZ NOT NULL DEFAULT NOW()
};

// ─── Table: availability ─────────────────────────────────────────────────────

export type Availability = {
  item_id: string; // UUID NOT NULL FK → items(id) ON DELETE CASCADE (PK part)
  date: string; // DATE NOT NULL (PK part, ISO: YYYY-MM-DD)
  is_available: boolean; // BOOLEAN NOT NULL DEFAULT TRUE
};

export type ItemWithPhotos = Item & {
  photos?: Photo[];
};
