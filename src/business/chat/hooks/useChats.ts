"use client";

import { getApiError, type ApiUiError } from "@/business/shared";
import { useFetchChatsQuery } from "../api";
import type { Chat, FetchChatsArgs } from "../types";

export type UseChatsResult = {
  chats: Chat[];
  nextCursor: string | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: ApiUiError | null;
  refetch: () => void;
};

export function useChats(params: FetchChatsArgs = {}): UseChatsResult {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useFetchChatsQuery(params);

  return {
    chats: data?.items ?? [],
    nextCursor: data?.nextCursor ?? null,
    isLoading,
    isFetching,
    isError,
    error: getApiError(error),
    refetch,
  };
}
