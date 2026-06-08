"use client";

import { useCallback } from "react";
import { getApiError, type ApiUiError } from "@/business/shared";
import { useSendMessageMutation } from "../api";
import type { ChatMessage, SendMessageRequestDto } from "../types";

export type UseSendChatMessageResult = {
  sendMessage: (payload: SendMessageRequestDto) => Promise<ChatMessage>;
  sentMessage: ChatMessage | null;
  isSending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: ApiUiError | null;
  reset: () => void;
};

export function useSendChatMessage(): UseSendChatMessageResult {
  const [sendMessageMutation, { data, isLoading, isError, isSuccess, error, reset }] =
    useSendMessageMutation();

  const sendMessage = useCallback(
    async (payload: SendMessageRequestDto) => {
      console.log("[TRACE][CHAT][REST] send message start", {
        chatId: payload.chatId,
        textLength: payload.text.length,
      });
      try {
        const message = await sendMessageMutation(payload).unwrap();
        console.log("[TRACE][CHAT][REST] send message success", {
          chatId: payload.chatId,
          messageId: message.id,
          messageType: message.messageType ?? "USER",
        });
        return message;
      } catch (error) {
        console.log("[TRACE][CHAT][REST] send message failed", {
          chatId: payload.chatId,
          error,
        });
        throw error;
      }
    },
    [sendMessageMutation],
  );

  return {
    sendMessage,
    sentMessage: data ?? null,
    isSending: isLoading,
    isError,
    isSuccess,
    error: getApiError(error),
    reset,
  };
}
