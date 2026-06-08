import type { ChatMessage } from "../types";

const STOMP_TERMINATOR = "\0";

type StompSubscription = {
  unsubscribe: () => void;
  disconnect: () => void;
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

function getDefaultChatWsUrl() {
  if (typeof window === "undefined") return "";

  const explicitUrl =
    process.env.NEXT_PUBLIC_CHAT_WS_URL ??
    process.env.NEXT_PUBLIC_COMMUNICATION_WS_URL;

  if (explicitUrl) return explicitUrl;

  return "ws://localhost:8184/ws";
}

function serializeFrame(
  command: string,
  headers: Record<string, string> = {},
  body = "",
) {
  const headerLines = Object.entries(headers).map(
    ([key, value]) => `${key}:${value}`,
  );
  return [command, ...headerLines, "", body].join("\n") + STOMP_TERMINATOR;
}

function parseFrames(payload: string) {
  return payload
    .split(STOMP_TERMINATOR)
    .map((frame) => frame.trim())
    .filter(Boolean)
    .map((frame) => {
      const [head, ...bodyParts] = frame.split("\n\n");
      const [command, ...headerLines] = head.split("\n");
      const headers = Object.fromEntries(
        headerLines
          .map((line) => {
            const separator = line.indexOf(":");
            return separator >= 0
              ? [line.slice(0, separator), line.slice(separator + 1)]
              : null;
          })
          .filter((entry): entry is [string, string] => Boolean(entry)),
      );

      return {
        command,
        headers,
        body: bodyParts.join("\n\n"),
      };
    });
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

export function subscribeToChatMessages(
  chatId: string,
  onMessage: (message: ChatMessage) => void,
  onError?: (error: Event | Error) => void,
): StompSubscription {
  const wsUrl = getDefaultChatWsUrl();
  const socket = new WebSocket(wsUrl);
  const subscriptionId = `chat-${chatId}`;
  let isConnected = false;

  socket.addEventListener("open", () => {
    socket.send(
      serializeFrame("CONNECT", {
        "accept-version": "1.2",
        "heart-beat": "10000,10000",
      }),
    );
  });

  socket.addEventListener("message", (event) => {
    const frames = parseFrames(String(event.data));

    for (const frame of frames) {
      if (frame.command === "CONNECTED" && !isConnected) {
        isConnected = true;
        socket.send(
          serializeFrame("SUBSCRIBE", {
            id: subscriptionId,
            destination: `/topic/chat/${chatId}`,
            ack: "auto",
          }),
        );
        continue;
      }

      if (frame.command === "MESSAGE" && frame.body) {
        try {
          const message = mapMessageResponse(
            JSON.parse(frame.body) as MessageResponse,
          );
          onMessage(message);
        } catch (error) {
          onError?.(
            error instanceof Error
              ? error
              : new Error("Invalid chat message frame"),
          );
        }
      }
    }
  });

  socket.addEventListener("error", (event) => {
    onError?.(event);
  });

  const unsubscribe = () => {
    if (socket.readyState !== WebSocket.OPEN || !isConnected) return;
    socket.send(serializeFrame("UNSUBSCRIBE", { id: subscriptionId }));
  };

  const disconnect = () => {
    unsubscribe();
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(serializeFrame("DISCONNECT"));
    }
    socket.close();
  };

  return { unsubscribe, disconnect };
}
