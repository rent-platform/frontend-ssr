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
    (payload: CreateChatRequestDto) => createChatMutation(payload).unwrap(),
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
