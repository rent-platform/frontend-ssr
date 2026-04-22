import type { Chat, Message, DealStatus } from '@/business/types/entity';

/* ═══ Current user (stub) ═══ */

export const CURRENT_USER_ID = 'u-001';

/* ═══ Chat Preview (list sidebar) ═══ */

export type ChatPreview = Pick<Chat, 'id' | 'item_id' | 'deal_id' | 'created_at'> & {
  counterpartyId: string;
  counterpartyName: string;
  counterpartyAvatar: string | null;
  isOnline: boolean;
  lastMessage: {
    text: string;
    sender_id: string;
    created_at: string;
  } | null;
  unreadCount: number;
  /** Item context */
  itemTitle: string;
  itemImage: string | null;
  /** Deal context */
  dealStatus: DealStatus | null;
  dealPrice: string | null;
  /** Pinned / archived */
  pinned: boolean;
};

/* ═══ Chat Message (enriched for UI) ═══ */

export type ChatMessage = Message & {
  isOwn: boolean;
  readAt: string | null;
};

/* ═══ System message (deal events) ═══ */

export type SystemEvent = {
  id: string;
  type: 'deal_created' | 'deal_confirmed' | 'deal_active' | 'deal_completed' | 'deal_rejected';
  text: string;
  created_at: string;
};

export type TimelineEntry =
  | { kind: 'message'; data: ChatMessage }
  | { kind: 'system'; data: SystemEvent }
  | { kind: 'date'; label: string };
