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
    (payload: MarkChatReadRequestDto) =>
      markChatReadMutation(payload).unwrap(),
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
