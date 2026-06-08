"use client";

import { useCallback } from "react";
import { getApiError, type ApiUiError } from "@/business/shared";
import { useCreateChatMutation } from "../api";
import type { Chat, CreateChatRequestDto } from "../types";

export type UseCreateChatResult = {
  createChat: (payload: CreateChatRequestDto) => Promise<Chat>;
  chat: Chat | null;
  isCreating: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: ApiUiError | null;
  reset: () => void;
};

export function useCreateChat(): UseCreateChatResult {
  const [createChatMutation, { data, isLoading, isError, isSuccess, error, reset }] =
    useCreateChatMutation();

  const createChat = useCallback(
    async (payload: CreateChatRequestDto) => {
      console.log("[TRACE][CHAT][REST] create chat start", {
        itemId: payload.itemId,
      });
      try {
        const chat = await createChatMutation(payload).unwrap();
        console.log("[TRACE][CHAT][REST] create chat success", {
          chatId: chat.id,
          itemId: payload.itemId,
        });
        return chat;
      } catch (error) {
        console.log("[TRACE][CHAT][REST] create chat failed", {
          itemId: payload.itemId,
          error,
        });
        throw error;
      }
    },
    [createChatMutation],
  );

  return {
    createChat,
    chat: data ?? null,
    isCreating: isLoading,
    isError,
    isSuccess,
    error: getApiError(error),
    reset,
  };
}
