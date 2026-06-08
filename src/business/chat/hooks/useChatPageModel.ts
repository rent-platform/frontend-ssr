"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type {
  Chat as ApiChat,
  ChatMessage as ApiChatMessage,
} from "@/business/chat/types";
import { mapDealStatusToLabel, type DealStatus } from "@/business/deals";
import {
  useChats,
  useMarkChatRead,
  useRealtimeChatMessages,
  useSendChatMessage,
} from ".";
import { useSession } from "@/business/auth";
import {
  useCancelDeal,
  useCompleteDeal,
  useConfirmDeal,
  useGetDealStatusHistory,
  useRejectDeal,
  useStartDeal,
} from "@/business/deals";
import {
  clearChatDraft,
  setActiveChat,
  setChatDraft,
  setChatSearch,
  setChatTab,
  showToast,
  useAppDispatch,
  useAppSelector,
} from "@/business/shared";
import { QUICK_ACTIONS } from "../constants";
import type { ChatListTab, ChatPreview, TimelineEntry } from "../types";

const DEAL_STATUS_EVENT_TYPE: Partial<
  Record<
    DealStatus,
    Extract<TimelineEntry, { kind: "system" }>["data"]["type"]
  >
> = {
  PENDING: "deal_created",
  CONFIRMED: "deal_confirmed",
  PAYMENT_PENDING: "deal_confirmed",
  PAID: "deal_confirmed",
  ACTIVE: "deal_active",
  COMPLETED: "deal_completed",
  REJECTED: "deal_rejected",
  CANCELLED: "deal_rejected",
};

function isDealStatus(value: unknown): value is DealStatus {
  return (
    value === "PENDING" ||
    value === "CONFIRMED" ||
    value === "PAYMENT_PENDING" ||
    value === "PAID" ||
    value === "ACTIVE" ||
    value === "COMPLETED" ||
    value === "REJECTED" ||
    value === "CANCELLED"
  );
}

function mapChatToPreview(chat: ApiChat, currentUserId: string): ChatPreview {
  const counterparty =
    chat.participants.find((p) => p.id !== currentUserId) ??
    chat.participants[0];

  return {
    id: chat.id,
    itemId: chat.itemId,
    dealId: chat.dealId,
    createdAt: chat.createdAt,
    counterpartyId: counterparty?.id ?? chat.otherUserId ?? "",
    counterpartyName:
      counterparty?.name ?? chat.otherUserNickname ?? "Пользователь",
    counterpartyAvatar:
      counterparty?.avatarUrl ?? chat.otherUserAvatarUrl ?? null,
    isOnline: counterparty?.isOnline ?? false,
    isTyping: false,
    lastMessage: chat.lastMessage
      ? {
          text: chat.lastMessage.text,
          senderId: chat.lastMessage.senderId,
          createdAt: chat.lastMessage.createdAt,
        }
      : null,
    unreadCount: chat.unreadCount,
    itemTitle: chat.itemTitle ?? (chat.itemId ? `Объявление ${chat.itemId}` : "Без объявления"),
    itemImage: chat.imageUrl ?? null,
    dealStatus: chat.dealStatus as ChatPreview["dealStatus"],
    dealPrice: null,
    dealDates: null,
    dealDeposit: null,
    myRole:
      chat.role === "OWNER"
        ? "owner"
        : chat.role === "RENTER"
          ? "renter"
          : "inquiry",
    pinned: false,
    archived: false,
  };
}

function mapMessage(
  message: ApiChatMessage,
  currentUserId: string,
): TimelineEntry {
  if (message.messageType === "DEAL_STATUS") {
    const status = message.systemPayload?.status;
    const statusText = isDealStatus(status)
      ? mapDealStatusToLabel(status)
      : message.text;

    return {
      kind: "system",
      data: {
        id: message.id,
        type: isDealStatus(status)
          ? DEAL_STATUS_EVENT_TYPE[status] ?? "deal_created"
          : "deal_created",
        text: `Статус сделки изменен: ${statusText}`,
        createdAt: message.createdAt,
      },
    };
  }

  return {
    kind: "message",
    data: {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      text: message.text,
      createdAt: message.createdAt,
      isOwn: message.senderId === currentUserId,
      readAt:
        message.readBy.find((receipt) => receipt.userId !== currentUserId)
          ?.readAt ?? null,
      image:
        message.attachments.find((attachment) =>
          attachment.mimeType.startsWith("image/"),
        )?.url ?? null,
    },
  };
}

export function useChatPageModel() {
  const dispatch = useAppDispatch();
  const { user } = useSession();
  const currentUserId = user?.id ?? "";
  const { activeChatId, search, tab, draftByChatId } = useAppSelector(
    (state) => state.chatUi,
  );
  const { chats, isLoading: isChatsLoading } = useChats({
    archived: false,
    search: search || undefined,
    limit: 50,
  });
  const activeChatRaw =
    chats.find((chat) => chat.id === activeChatId) ?? null;
  const activeChat = activeChatRaw
    ? mapChatToPreview(activeChatRaw, currentUserId)
    : null;
  const { messages } = useRealtimeChatMessages(
    activeChatId ? { chatId: activeChatId, limit: 50 } : null,
  );
  const { history } = useGetDealStatusHistory(activeChat?.dealId);
  const { sendMessage, isSending } = useSendChatMessage();
  const { markChatRead } = useMarkChatRead();
  const { confirmDeal, isConfirming } = useConfirmDeal();
  const { rejectDeal, isRejecting } = useRejectDeal();
  const { cancelDeal, isCancelling } = useCancelDeal();
  const { startDeal, isStarting } = useStartDeal();
  const { completeDeal, isCompleting } = useCompleteDeal();
  const isDealActionBusy =
    isConfirming || isRejecting || isCancelling || isStarting || isCompleting;
  const inputText = activeChatId ? draftByChatId[activeChatId] ?? "" : "";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      console.log("[TRACE][CHAT][UI] active chat auto selected", {
        chatId: chats[0].id,
      });
      dispatch(setActiveChat(chats[0].id));
    }
  }, [activeChatId, chats, dispatch]);

  useEffect(() => {
    if (!activeChatId) return;

    markChatRead({ chatId: activeChatId }).catch(() => {
      dispatch(
        showToast({
          type: "error",
          message: "Не удалось отметить чат прочитанным",
        }),
      );
    });
  }, [activeChatId, dispatch, markChatRead]);

  const quickActions = useMemo(() => {
    if (!activeChat?.dealId) return [];
    const status = history.at(-1)?.newStatus ?? activeChat.dealStatus ?? "PENDING";
    return QUICK_ACTIONS[status] ?? [];
  }, [activeChat, history]);

  const filteredChats = useMemo(() => {
    const previews = chats.map((chat) => mapChatToPreview(chat, currentUserId));
    let list = previews.filter((c) => !c.archived);

    if (tab === "renting_out") list = list.filter((c) => c.myRole === "owner");
    else if (tab === "renting_in") {
      list = list.filter((c) => c.myRole === "renter");
    } else if (tab === "inquiries") {
      list = list.filter((c) => c.myRole === "inquiry");
    }

    return list.sort((a, b) => {
      const ta = a.lastMessage?.createdAt ?? a.createdAt;
      const tb = b.lastMessage?.createdAt ?? b.createdAt;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
  }, [chats, currentUserId, tab]);

  const tabCounts = useMemo(() => {
    const active = chats
      .map((chat) => mapChatToPreview(chat, currentUserId))
      .filter((c) => !c.archived);
    return {
      all: active.length,
      renting_out: active.filter((c) => c.myRole === "owner").length,
      renting_in: active.filter((c) => c.myRole === "renter").length,
      inquiries: active.filter((c) => c.myRole === "inquiry").length,
    };
  }, [chats, currentUserId]);

  const timeline = useMemo<TimelineEntry[]>(() => {
    const messageEntries = messages.map((message) =>
      mapMessage(message, currentUserId),
    );
    const statusEntries: TimelineEntry[] = history.map((item) => ({
      kind: "system",
      data: {
        id: item.id,
        type:
          item.newStatus === "CONFIRMED"
            ? "deal_confirmed"
            : item.newStatus === "PAYMENT_PENDING" ||
                item.newStatus === "PAID"
              ? "deal_confirmed"
              : item.newStatus === "ACTIVE"
                ? "deal_active"
                : item.newStatus === "COMPLETED"
                  ? "deal_completed"
                  : item.newStatus === "REJECTED"
                    ? "deal_rejected"
                    : "deal_created",
        text: item.comment
          ? `${item.newStatusLabel}: ${item.comment}`
          : item.newStatusLabel,
        createdAt: item.changedAt,
      },
    }));

    return [...messageEntries, ...statusEntries].sort((a, b) => {
      const aDate =
        a.kind === "message" || a.kind === "system" ? a.data.createdAt : "";
      const bDate =
        b.kind === "message" || b.kind === "system" ? b.data.createdAt : "";
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });
  }, [currentUserId, history, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatId, timeline.length]);

  const handleInput = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (activeChatId) {
        dispatch(setChatDraft({ chatId: activeChatId, text: e.target.value }));
      }
      const el = e.target;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    },
    [activeChatId, dispatch],
  );

  const handleSend = useCallback(async () => {
    if (!activeChatId || !inputText.trim() || isSending) return;
    console.log("[TRACE][CHAT][UI] send message clicked", {
      chatId: activeChatId,
      textLength: inputText.trim().length,
    });
    try {
      await sendMessage({ chatId: activeChatId, text: inputText.trim() });
      dispatch(clearChatDraft(activeChatId));
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch {
      dispatch(
        showToast({
          type: "error",
          message: "Не удалось отправить сообщение",
        }),
      );
    }
  }, [activeChatId, dispatch, inputText, isSending, sendMessage]);

  const handleQuickAction = useCallback(
    async (actionId: string) => {
      if (!activeChat?.dealId) return;
      try {
        if (actionId === "qa-confirm") {
          const confirmedDeal = await confirmDeal(activeChat.dealId);
          console.log(
            "[TRACE][DEAL_STATUS][FLOW] deal confirmed from chat, owner creates payment invoice",
            {
              dealId: confirmedDeal.id,
              currentStatus: confirmedDeal.status,
              nextExpectedStatus: "PAYMENT_PENDING",
            },
          );
        }
        if (actionId === "qa-reject") {
          await rejectDeal(activeChat.dealId, { reason: "Отклонено из чата" });
        }
        if (actionId === "qa-cancel") {
          console.log("[TRACE][DEAL_STATUS][FLOW] cancel requested from chat", {
            dealId: activeChat.dealId,
          });
          await cancelDeal(activeChat.dealId, "Отменено из чата");
        }
        if (actionId === "qa-confirm-start") {
          console.log(
            "[TRACE][DEAL_STATUS][FLOW] start confirmation submitted from chat",
            {
              dealId: activeChat.dealId,
              expectedFinalStatusAfterBothParties: "ACTIVE",
            },
          );
          const startedDeal = await startDeal(activeChat.dealId);
          console.log("[TRACE][DEAL_STATUS][FLOW] start confirmation result from chat", {
            dealId: startedDeal.id,
            status: startedDeal.status,
            nextExpectedStatus: startedDeal.status === "ACTIVE" ? "ACTIVE" : "PAID",
          });
        }
        if (actionId === "qa-complete-ok" || actionId === "qa-complete-damaged") {
          const itemOk = actionId === "qa-complete-ok";
          console.log(
            "[TRACE][DEAL_STATUS][FLOW] completion confirmation submitted from chat",
            {
              dealId: activeChat.dealId,
              itemOk,
              settlementPolicy: itemOk
                ? "rent_captured_deposit_refunded"
                : "rent_and_deposit_captured",
              expectedFinalStatusAfterBothParties: "COMPLETED",
            },
          );
          const completedDeal = await completeDeal(activeChat.dealId, itemOk);
          console.log(
            "[TRACE][DEAL_STATUS][FLOW] completion confirmation result from chat",
            {
              dealId: completedDeal.id,
              status: completedDeal.status,
              settlementPolicy: itemOk
                ? "rent_captured_deposit_refunded"
                : "rent_and_deposit_captured",
            },
          );
        }
        dispatch(showToast({ type: "success", message: "Статус сделки обновлен" }));
      } catch {
        dispatch(
          showToast({
            type: "error",
            message: "Не удалось обновить статус сделки",
          }),
        );
      }
    },
    [
      activeChat,
      cancelDeal,
      completeDeal,
      confirmDeal,
      dispatch,
      rejectDeal,
      startDeal,
    ],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  const handleSelectChat = useCallback(
    (chatId: string) => {
      console.log("[TRACE][CHAT][UI] active chat selected", { chatId });
      dispatch(setActiveChat(chatId));
    },
    [dispatch],
  );

  return {
    activeChat,
    activeChatId,
    filteredChats,
    handleInput,
    handleKeyDown,
    handleQuickAction,
    handleSearchChange: (nextSearch: string) => dispatch(setChatSearch(nextSearch)),
    handleSelectChat,
    handleSend,
    handleTabChange: (nextTab: ChatListTab) => dispatch(setChatTab(nextTab)),
    inputText,
    isChatsLoading,
    isDealActionBusy,
    isSending,
    messagesEndRef,
    quickActions,
    search,
    tab: tab as ChatListTab,
    tabCounts,
    textareaRef,
    timeline,
  };
}
