export type ISODateString = string;

export type ChatParticipant = {
  id: string;
  name: string;
  avatarUrl: string | null;
  isOnline?: boolean;
};

export type ChatLastMessage = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: ISODateString;
};

export type Chat = {
  id: string;
  itemId: string | null;
  dealId: string | null;
  participants: ChatParticipant[];
  lastMessage: ChatLastMessage | null;
  unreadCount: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  attachments: ChatMessageAttachment[];
  readBy: ChatMessageReadReceipt[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type ChatMessageAttachment = {
  id: string;
  url: string;
  mimeType: string;
  fileName: string | null;
};

export type ChatMessageReadReceipt = {
  userId: string;
  readAt: ISODateString;
};

export type FetchChatsArgs = {
  search?: string;
  archived?: boolean;
  cursor?: string;
  limit?: number;
};

export type FetchChatMessagesArgs = {
  chatId: string;
  cursor?: string;
  limit?: number;
};

export type ChatPageResponse<T> = {
  items: T[];
  nextCursor: string | null;
};

export type CreateChatRequestDto = {
  itemId: string;
  message: string;
  recipientId?: string;
};

export type SendMessageRequestDto = {
  chatId: string;
  text: string;
  attachmentIds?: string[];
  clientMessageId?: string;
};

export type MarkChatReadRequestDto = {
  chatId: string;
  messageId?: string;
};

export type SetTypingRequestDto = {
  chatId: string;
  isTyping: boolean;
};

export type ChatTypingEvent = {
  chatId: string;
  userId: string;
  isTyping: boolean;
};

export type ChatReadEvent = {
  chatId: string;
  userId: string;
  messageIds: string[];
  readAt: ISODateString;
};
