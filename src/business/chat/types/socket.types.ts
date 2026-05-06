import type {
  Chat,
  ChatMessage,
  ChatReadEvent,
  ChatTypingEvent,
  CreateChatRequestDto,
  MarkChatReadRequestDto,
  SendMessageRequestDto,
  SetTypingRequestDto,
} from "./chat.types";

export type ChatSocketAck<T> =
  | { ok: true; data: T }
  | { ok: false; error: { status?: number; message: string } };

export type ChatSocketAckError = Extract<
  ChatSocketAck<unknown>,
  { ok: false }
>["error"];

export type ChatServerToClientEvents = {
  "chat:created": (chat: Chat) => void;
  "chat:updated": (chat: Chat) => void;
  "message:created": (message: ChatMessage) => void;
  "message:updated": (message: ChatMessage) => void;
  "message:deleted": (payload: { chatId: string; messageId: string }) => void;
  "chat:typing": (event: ChatTypingEvent) => void;
  "chat:read": (event: ChatReadEvent) => void;
};

export type ChatClientToServerEvents = {
  "chat:join": (
    payload: { chatId: string },
    ack?: (response: ChatSocketAck<{ joined: true }>) => void,
  ) => void;
  "chat:leave": (payload: { chatId: string }) => void;
  "chat:create": (
    payload: CreateChatRequestDto,
    ack: (response: ChatSocketAck<Chat>) => void,
  ) => void;
  "message:send": (
    payload: SendMessageRequestDto,
    ack: (response: ChatSocketAck<ChatMessage>) => void,
  ) => void;
  "chat:read": (
    payload: MarkChatReadRequestDto,
    ack: (response: ChatSocketAck<ChatReadEvent>) => void,
  ) => void;
  "chat:typing": (payload: SetTypingRequestDto) => void;
};
