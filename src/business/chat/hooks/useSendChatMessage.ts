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
    (payload: SendMessageRequestDto) => sendMessageMutation(payload).unwrap(),
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
