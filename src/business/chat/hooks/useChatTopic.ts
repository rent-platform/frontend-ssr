"use client";

import { useEffect } from "react";
import { subscribeToChatMessages } from "../api/chatStompClient";
import type { ChatMessage } from "../types";

type UseChatTopicArgs = {
  chatId: string | null;
  onMessage: (message: ChatMessage) => void;
  onError?: (error: Event | Error) => void;
};

export function useChatTopic({ chatId, onMessage, onError }: UseChatTopicArgs) {
  useEffect(() => {
    if (!chatId) return;

    const subscription = subscribeToChatMessages(chatId, onMessage, onError);
    return () => subscription.disconnect();
  }, [chatId, onError, onMessage]);
}
