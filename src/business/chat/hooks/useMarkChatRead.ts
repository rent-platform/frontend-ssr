"use client";

import { useCallback } from "react";
import { getApiError, type ApiUiError } from "@/business/shared";
import { useMarkChatReadMutation } from "../api";
import type { ChatReadEvent, MarkChatReadRequestDto } from "../types";

export type UseMarkChatReadResult = {
  markChatRead: (payload: MarkChatReadRequestDto) => Promise<ChatReadEvent>;
  readEvent: ChatReadEvent | null;
  isMarkingRead: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: ApiUiError | null;
  reset: () => void;
};

export function useMarkChatRead(): UseMarkChatReadResult {
  const [
    markChatReadMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useMarkChatReadMutation();

  const markChatRead = useCallback(
    async (payload: MarkChatReadRequestDto) => {
      console.log("[TRACE][CHAT][REST] mark chat read start", {
        chatId: payload.chatId,
      });
      try {
        const event = await markChatReadMutation(payload).unwrap();
        console.log("[TRACE][CHAT][REST] mark chat read success", {
          chatId: payload.chatId,
          readAt: event.readAt,
        });
        return event;
      } catch (error) {
        console.log("[TRACE][CHAT][REST] mark chat read failed", {
          chatId: payload.chatId,
          error,
        });
        throw error;
      }
    },
    [markChatReadMutation],
  );

  return {
    markChatRead,
    readEvent: data ?? null,
    isMarkingRead: isLoading,
    isError,
    isSuccess,
    error: getApiError(error),
    reset,
  };
}
