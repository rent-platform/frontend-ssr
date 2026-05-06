"use client";

import { useCallback } from "react";
import { getApiError, type ApiUiError } from "@/business/shared";
import { useSetChatTypingMutation } from "../api";
import type { SetTypingRequestDto } from "../types";

export type UseChatTypingResult = {
  setTyping: (payload: SetTypingRequestDto) => Promise<void>;
  isSettingTyping: boolean;
  isError: boolean;
  error: ApiUiError | null;
  reset: () => void;
};

export function useChatTyping(): UseChatTypingResult {
  const [setChatTypingMutation, { isLoading, isError, error, reset }] =
    useSetChatTypingMutation();

  const setTyping = useCallback(
    (payload: SetTypingRequestDto) => setChatTypingMutation(payload).unwrap(),
    [setChatTypingMutation],
  );

  return {
    setTyping,
    isSettingTyping: isLoading,
    isError,
    error: getApiError(error),
    reset,
  };
}
