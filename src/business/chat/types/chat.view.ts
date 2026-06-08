import type { DealStatus } from "@/business/deals/types";
import type { Chat, ChatMessage as BaseMessage } from "./chat.types";

export type ChatListTab = "all" | "renting_out" | "renting_in" | "inquiries";

export type ChatPreview = Pick<
  Chat,
  "id" | "itemId" | "dealId" | "createdAt"
> & {
  counterpartyId: string;
  counterpartyName: string;
  counterpartyAvatar: string | null;
  isOnline: boolean;
  isTyping: boolean;
  lastMessage: {
    text: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  itemTitle: string;
  itemImage: string | null;
  dealStatus: DealStatus | null;
  dealPrice: string | null;
  dealDates: { start: string; end: string } | null;
  dealDeposit: string | null;
  myRole: "owner" | "renter" | "inquiry";
  pinned: boolean;
  archived: boolean;
};

export type ChatTimelineMessage = Pick<
  BaseMessage,
  "id" | "chatId" | "senderId" | "text" | "createdAt"
> & {
  isOwn: boolean;
  readAt: string | null;
  image: string | null;
};

export type SystemEvent = {
  id: string;
  type:
    | "deal_created"
    | "deal_confirmed"
    | "deal_active"
    | "deal_completed"
    | "deal_rejected"
    | "deal_reviewed";
  text: string;
  createdAt: string;
};

export type QuickAction = {
  id: string;
  label: string;
  variant: "primary" | "secondary" | "danger";
  icon?: string;
};

export type TimelineEntry =
  | { kind: "message"; data: ChatTimelineMessage }
  | { kind: "system"; data: SystemEvent }
  | { kind: "date"; label: string };

export type ConversationHeaderProps = { chat: ChatPreview };
export type DealContextBarProps = { chat: ChatPreview };
export type QuickActionsBarProps = {
  actions: QuickAction[];
  onAction?: (actionId: string) => void;
  isBusy?: boolean;
};
export type TimelineItemProps = { entry: TimelineEntry };
export type MessageBubbleProps = { message: ChatTimelineMessage };
