"use client";

import { getApiError, type ApiUiError } from "@/business/shared";
import { useFetchChatMessagesQuery } from "../api";
import type { ChatMessage, FetchChatMessagesArgs } from "../types";

export type UseChatMessagesResult = {
  messages: ChatMessage[];
  nextCursor: string | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
};

export function useChatMessages(
  params: FetchChatMessagesArgs,
): UseChatMessagesResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchChatMessagesQuery(params);

  return {
    messages: data?.items ?? [],
    nextCursor: data?.nextCursor ?? null,
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}
