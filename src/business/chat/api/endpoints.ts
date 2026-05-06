import { baseApi } from "@/business/shared";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import type {
  Chat,
  ChatClientToServerEvents,
  ChatMessage,
  ChatPageResponse,
  ChatReadEvent,
  ChatSocketAck,
  ChatSocketAckError,
  ChatServerToClientEvents,
  CreateChatRequestDto,
  FetchChatMessagesArgs,
  FetchChatsArgs,
  MarkChatReadRequestDto,
  SendMessageRequestDto,
  SetTypingRequestDto,
} from "../types";

const CHATS_URL = "api/chats";
const CHAT_LIST_TAG_ID = "LIST";

let socket: Socket<ChatServerToClientEvents, ChatClientToServerEvents> | null =
  null;

function getSocket() {
  if (typeof window === "undefined") {
    throw new Error("Chat socket is available only in the browser.");
  }

  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ?? window.location.origin,
      {
        path: process.env.NEXT_PUBLIC_SOCKET_PATH ?? "/socket.io",
        transports: ["websocket"],
        withCredentials: true,
        autoConnect: false,
      },
    );
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

function toSocketError(error: ChatSocketAckError): FetchBaseQueryError {
  return {
    status: error.status ?? "CUSTOM_ERROR",
    data: { message: error.message },
    error: error.message,
  };
}

function emitWithAck<EventName extends keyof ChatClientToServerEvents, Result>(
  eventName: EventName,
  payload: Parameters<ChatClientToServerEvents[EventName]>[0],
) {
  return new Promise<Result>((resolve, reject) => {
    const activeSocket = getSocket();
    const emit = activeSocket.timeout(10_000).emit as unknown as (
      event: EventName,
      payload: Parameters<ChatClientToServerEvents[EventName]>[0],
      callback: (
        transportError: Error | null,
        response?: ChatSocketAck<Result>,
      ) => void,
    ) => void;

    emit(
      eventName,
      payload,
      (
        transportError: Error | null,
        response?: ChatSocketAck<Result>,
      ) => {
        if (transportError) {
          reject({
            status: "CUSTOM_ERROR",
            data: { message: transportError.message },
            error: transportError.message,
          } satisfies FetchBaseQueryError);
          return;
        }

        if (!response) {
          reject({
            status: "CUSTOM_ERROR",
            data: { message: "Socket acknowledgement is empty." },
            error: "Socket acknowledgement is empty.",
          } satisfies FetchBaseQueryError);
          return;
        }

        if (!response.ok) {
          reject(toSocketError(response.error));
          return;
        }

        resolve(response.data);
      },
    );
  });
}

function upsertById<T extends { id: string }>(items: T[], nextItem: T) {
  const index = items.findIndex((item) => item.id === nextItem.id);

  if (index === -1) {
    items.unshift(nextItem);
    return;
  }

  items[index] = nextItem;
}

function buildChatParams({
  search,
  archived,
  cursor,
  limit = 30,
}: FetchChatsArgs = {}) {
  return {
    ...(search ? { search } : {}),
    ...(typeof archived === "boolean" ? { archived: String(archived) } : {}),
    ...(cursor ? { cursor } : {}),
    limit: String(limit),
  };
}

function buildMessageParams({ cursor, limit = 50 }: FetchChatMessagesArgs) {
  return {
    ...(cursor ? { cursor } : {}),
    limit: String(limit),
  };
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchChats: build.query<ChatPageResponse<Chat>, FetchChatsArgs | void>({
      query: (args) => ({
        url: CHATS_URL,
        params: buildChatParams(args || undefined),
      }),
      providesTags: (result) => [
        { type: "Chats", id: CHAT_LIST_TAG_ID },
        ...(result?.items.map((chat) => ({
          type: "Chats" as const,
          id: chat.id,
        })) ?? []),
      ],
      async onCacheEntryAdded(
        _args,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData },
      ) {
        await cacheDataLoaded;
        const activeSocket = getSocket();

        const upsertChat = (chat: Chat) => {
          updateCachedData((draft) => {
            upsertById(draft.items, chat);
          });
        };

        activeSocket.on("chat:created", upsertChat);
        activeSocket.on("chat:updated", upsertChat);

        await cacheEntryRemoved;
        activeSocket.off("chat:created", upsertChat);
        activeSocket.off("chat:updated", upsertChat);
      },
    }),

    fetchChatMessages: build.query<
      ChatPageResponse<ChatMessage>,
      FetchChatMessagesArgs
    >({
      query: (args) => ({
        url: `${CHATS_URL}/${args.chatId}/messages`,
        params: buildMessageParams(args),
      }),
      providesTags: (result, _error, { chatId }) => [
        { type: "ChatMessages", id: chatId },
        ...(result?.items.map((message) => ({
          type: "ChatMessages" as const,
          id: message.id,
        })) ?? []),
      ],
      async onCacheEntryAdded(
        { chatId },
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData },
      ) {
        await cacheDataLoaded;
        const activeSocket = getSocket();

        activeSocket.emit("chat:join", { chatId });

        const upsertMessage = (message: ChatMessage) => {
          if (message.chatId !== chatId) return;

          updateCachedData((draft) => {
            upsertById(draft.items, message);
            draft.items.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            );
          });
        };

        const deleteMessage = (payload: {
          chatId: string;
          messageId: string;
        }) => {
          if (payload.chatId !== chatId) return;

          updateCachedData((draft) => {
            draft.items = draft.items.filter(
              (message) => message.id !== payload.messageId,
            );
          });
        };

        const markRead = (event: ChatReadEvent) => {
          if (event.chatId !== chatId) return;

          updateCachedData((draft) => {
            const messageIds = new Set(event.messageIds);

            for (const message of draft.items) {
              if (!messageIds.has(message.id)) continue;
              const alreadyRead = message.readBy.some(
                (receipt) => receipt.userId === event.userId,
              );

              if (!alreadyRead) {
                message.readBy.push({
                  userId: event.userId,
                  readAt: event.readAt,
                });
              }
            }
          });
        };

        activeSocket.on("message:created", upsertMessage);
        activeSocket.on("message:updated", upsertMessage);
        activeSocket.on("message:deleted", deleteMessage);
        activeSocket.on("chat:read", markRead);

        await cacheEntryRemoved;
        activeSocket.emit("chat:leave", { chatId });
        activeSocket.off("message:created", upsertMessage);
        activeSocket.off("message:updated", upsertMessage);
        activeSocket.off("message:deleted", deleteMessage);
        activeSocket.off("chat:read", markRead);
      },
    }),

    createChat: build.mutation<Chat, CreateChatRequestDto>({
      async queryFn(body) {
        try {
          return {
            data: await emitWithAck<"chat:create", Chat>(
              "chat:create",
              body,
            ),
          };
        } catch (error) {
          return { error: error as FetchBaseQueryError };
        }
      },
      invalidatesTags: (result) => [
        { type: "Chats", id: CHAT_LIST_TAG_ID },
        ...(result ? [{ type: "Chats" as const, id: result.id }] : []),
      ],
    }),

    sendMessage: build.mutation<ChatMessage, SendMessageRequestDto>({
      async queryFn(body) {
        try {
          return {
            data: await emitWithAck<"message:send", ChatMessage>(
              "message:send",
              body,
            ),
          };
        } catch (error) {
          return { error: error as FetchBaseQueryError };
        }
      },
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Chats", id: chatId },
        { type: "Chats", id: CHAT_LIST_TAG_ID },
        { type: "ChatMessages", id: chatId },
      ],
    }),

    markChatRead: build.mutation<ChatReadEvent, MarkChatReadRequestDto>({
      async queryFn(body) {
        try {
          return {
            data: await emitWithAck<"chat:read", ChatReadEvent>(
              "chat:read",
              body,
            ),
          };
        } catch (error) {
          return { error: error as FetchBaseQueryError };
        }
      },
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Chats", id: chatId },
        { type: "ChatMessages", id: chatId },
      ],
    }),

    setChatTyping: build.mutation<void, SetTypingRequestDto>({
      queryFn(body) {
        try {
          getSocket().emit("chat:typing", body);
          return { data: undefined };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to emit typing status.";

          return {
            error: {
              status: "CUSTOM_ERROR",
              data: { message },
              error: message,
            } satisfies FetchBaseQueryError,
          };
        }
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
