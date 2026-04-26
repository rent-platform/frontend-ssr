import type { Chat, Message, DealStatus } from '@/business/types/entity';

/* ═══ Current user (stub) ═══ */

export const CURRENT_USER_ID = 'u-001';

/* ═══ Sidebar filter tab ═══ */

export type ChatListTab = 'all' | 'renting_out' | 'renting_in' | 'inquiries';

/* ═══ Chat Preview (list sidebar) ═══ */

export type ChatPreview = Pick<Chat, 'id' | 'item_id' | 'deal_id' | 'created_at'> & {
  counterpartyId: string;
  counterpartyName: string;
  counterpartyAvatar: string | null;
  isOnline: boolean;
  isTyping: boolean;
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
  dealDates: { start: string; end: string } | null;
  dealDeposit: string | null;
  /** My role in this chat */
  myRole: 'owner' | 'renter' | 'inquiry';
  /** Pinned / archived */
  pinned: boolean;
  archived: boolean;
};

/* ═══ Chat Message (enriched for UI) ═══ */

export type ChatMessage = Message & {
  isOwn: boolean;
  readAt: string | null;
  /** Optional image attachment */
  image: string | null;
};

/* ═══ System message (deal events) ═══ */

export type SystemEvent = {
  id: string;
  type: 'deal_created' | 'deal_confirmed' | 'deal_active' | 'deal_completed' | 'deal_rejected' | 'deal_reviewed';
  text: string;
  created_at: string;
};

/* ═══ Quick action for deal management in chat ═══ */

export type QuickAction = {
  id: string;
  label: string;
  variant: 'primary' | 'secondary' | 'danger';
  icon?: string;
};

/* ═══ Timeline ═══ */

export type TimelineEntry =
  | { kind: 'message'; data: ChatMessage }
  | { kind: 'system'; data: SystemEvent }
  | { kind: 'date'; label: string };
