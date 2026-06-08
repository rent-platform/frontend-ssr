import { baseApi } from "@/business/shared";
import type {
  Chat,
  ChatMessage,
  ChatPageResponse,
  ChatReadEvent,
  CreateChatRequestDto,
  FetchChatMessagesArgs,
  FetchChatsArgs,
  MarkChatReadRequestDto,
  SendMessageRequestDto,
  SetTypingRequestDto,
} from "../types";

const CHATS_URL = "api/chats";
const CHAT_LIST_TAG_ID = "LIST";

type ChatListItemResponse = {
  id: string;
  itemId: string | null;
  itemTitle?: string | null;
  imageUrl?: string | null;
  otherUserId?: string | null;
  otherUserNickname?: string | null;
  otherUserAvatarUrl?: string | null;
  lastMessage?: string | null;
  lastMessageTime?: string | null;
  unreadCount?: number;
  dealStatus?: string | null;
  role?: string | null;
};

type MessageResponse = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  messageType?: string | null;
  systemPayload?: Record<string, unknown> | null;
  createdAt: string;
};

function buildChatParams({ role = "RENTER" }: FetchChatsArgs = {}) {
  return {
    role,
  };
}

function buildMessageParams({ cursor, limit = 50 }: FetchChatMessagesArgs) {
  return {
    ...(cursor ? { before: cursor } : {}),
    limit: String(limit),
  };
}

function mapChatResponse(chat: ChatListItemResponse): Chat {
  const otherUserId = chat.otherUserId ?? "";
  const otherUserName = chat.otherUserNickname ?? "Пользователь";
  const lastMessage = chat.lastMessage
    ? {
        id: `${chat.id}-last-message`,
        chatId: chat.id,
        senderId: otherUserId,
        text: chat.lastMessage,
        createdAt: chat.lastMessageTime ?? new Date(0).toISOString(),
      }
    : null;

  return {
    id: chat.id,
    itemId: chat.itemId,
    itemTitle: chat.itemTitle,
    imageUrl: chat.imageUrl,
    otherUserId,
    otherUserNickname: chat.otherUserNickname,
    otherUserAvatarUrl: chat.otherUserAvatarUrl,
    dealId: null,
    participants: otherUserId
      ? [
          {
            id: otherUserId,
            name: otherUserName,
            avatarUrl: chat.otherUserAvatarUrl ?? null,
          },
        ]
      : [],
    lastMessage,
    lastMessageTime: chat.lastMessageTime ?? null,
    unreadCount: chat.unreadCount ?? 0,
    dealStatus: chat.dealStatus ?? null,
    role: chat.role ?? null,
    createdAt: chat.lastMessageTime ?? new Date(0).toISOString(),
    updatedAt: chat.lastMessageTime ?? new Date(0).toISOString(),
  };
}

function mapMessageResponse(message: MessageResponse): ChatMessage {
  return {
    id: message.id,
    chatId: message.chatId,
    senderId: message.senderId,
    text: message.text,
    messageType: message.messageType,
    systemPayload: message.systemPayload,
    attachments: [],
    readBy: [],
    createdAt: message.createdAt,
    updatedAt: message.createdAt,
  };
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchChats: build.query<ChatPageResponse<Chat>, FetchChatsArgs | void>({
      query: (args) => ({
        url: CHATS_URL,
        params: buildChatParams(args || undefined),
      }),
      transformResponse: (response: ChatListItemResponse[]) => ({
        items: response.map(mapChatResponse),
        nextCursor: null,
      }),
      providesTags: (result) => [
        { type: "Chats", id: CHAT_LIST_TAG_ID },
        ...(result?.items.map((chat) => ({
          type: "Chats" as const,
          id: chat.id,
        })) ?? []),
      ],
    }),

    fetchChatMessages: build.query<
      ChatPageResponse<ChatMessage>,
      FetchChatMessagesArgs
    >({
      query: (args) => ({
        url: `${CHATS_URL}/${args.chatId}/messages`,
        params: buildMessageParams(args),
      }),
      transformResponse: (response: MessageResponse[]) => ({
        items: response.map(mapMessageResponse),
        nextCursor: null,
      }),
      providesTags: (result, _error, { chatId }) => [
        { type: "ChatMessages", id: chatId },
        ...(result?.items.map((message) => ({
          type: "ChatMessages" as const,
          id: message.id,
        })) ?? []),
      ],
    }),

    createChat: build.mutation<Chat, CreateChatRequestDto>({
      query: ({ itemId }) => ({
        url: CHATS_URL,
        method: "POST",
        params: { itemId },
      }),
      transformResponse: (response: ChatListItemResponse) =>
        mapChatResponse(response),
      invalidatesTags: (result) => [
        { type: "Chats", id: CHAT_LIST_TAG_ID },
        ...(result ? [{ type: "Chats" as const, id: result.id }] : []),
      ],
    }),

    sendMessage: build.mutation<ChatMessage, SendMessageRequestDto>({
      query: ({ chatId, text }) => ({
        url: `${CHATS_URL}/${chatId}/messages`,
        method: "POST",
        body: { text },
      }),
      transformResponse: (response: MessageResponse) =>
        mapMessageResponse(response),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Chats", id: chatId },
        { type: "Chats", id: CHAT_LIST_TAG_ID },
        { type: "ChatMessages", id: chatId },
      ],
    }),

    markChatRead: build.mutation<ChatReadEvent, MarkChatReadRequestDto>({
      query: ({ chatId }) => ({
        url: `${CHATS_URL}/${chatId}/read`,
        method: "POST",
      }),
      transformResponse: (_response: unknown, _meta, { chatId }) => ({
        chatId,
        userId: "",
        messageIds: [],
        readAt: new Date().toISOString(),
      }),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Chats", id: chatId },
        { type: "ChatMessages", id: chatId },
      ],
    }),

    setChatTyping: build.mutation<void, SetTypingRequestDto>({
      queryFn() {
        return { data: undefined };
      },
    }),
  }),
});

export const {
  useFetchChatsQuery,
  useFetchChatMessagesQuery,
  useCreateChatMutation,
  useSendMessageMutation,
  useMarkChatReadMutation,
  useSetChatTypingMutation,
} = chatApi;
