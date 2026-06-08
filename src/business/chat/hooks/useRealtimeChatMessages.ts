"use client";

import { useCallback } from "react";
import { chatApi } from "../api";
import { useChatMessages } from "./useChatMessages";
import { useChatTopic } from "./useChatTopic";
import { useAppDispatch } from "@/business/shared";
import type { ChatMessage, FetchChatMessagesArgs } from "../types";

export function useRealtimeChatMessages(
  params: FetchChatMessagesArgs | null | undefined,
) {
  const dispatch = useAppDispatch();
  const query = useChatMessages(params);
  const chatId = params?.chatId ?? null;

  const mergeSocketMessage = useCallback(
    (message: ChatMessage) => {
      if (!params || message.chatId !== params.chatId) return;
      dispatch(
        chatApi.util.updateQueryData("fetchChatMessages", params, (draft) => {
          if (draft.items.some((item) => item.id === message.id)) return;
          draft.items.push(message);
          draft.items.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        }),
      );
      dispatch(
        chatApi.util.invalidateTags([
          { type: "Chats", id: message.chatId },
          { type: "Chats", id: "LIST" },
        ]),
      );
    },
    [dispatch, params],
  );
  const handleSocketError = useCallback((error: Event | Error) => {
    console.warn("Chat WebSocket error", error);
  }, []);
  useChatTopic({
    chatId,
    onMessage: mergeSocketMessage,
    onError: handleSocketError,
  });

  return query;
}
