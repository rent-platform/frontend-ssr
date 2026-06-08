"use client";

import { MessageCircle, Paperclip, Send } from "lucide-react";
import {
  ChatSidebar,
  ConversationHeader,
  DealContextBar,
  QuickActionsBar,
  TimelineItem,
  TypingIndicator,
} from "./components";
import { useChatPageModel } from "@/business/chat";
import styles from "./ChatPage.module.scss";

export function ChatPage() {
  const {
    activeChat,
    activeChatId,
    filteredChats,
    handleInput,
    handleKeyDown,
    handleQuickAction,
    handleSearchChange,
    handleSelectChat,
    handleSend,
    handleTabChange,
    inputText,
    isChatsLoading,
    isDealActionBusy,
    isSending,
    messagesEndRef,
    quickActions,
    search,
    tab,
    tabCounts,
    textareaRef,
    timeline,
  } = useChatPageModel();

  return (
    <div className={styles.page}>
      <ChatSidebar
        tab={tab}
        onTabChange={handleTabChange}
        tabCounts={tabCounts}
        search={search}
        onSearchChange={handleSearchChange}
        filteredChats={filteredChats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
      />

      <main className={styles.conversation}>
        {activeChat ? (
          <>
            <ConversationHeader chat={activeChat} />
            {activeChat.itemTitle && <DealContextBar chat={activeChat} />}
            {quickActions.length > 0 && (
              <QuickActionsBar
                actions={quickActions}
                isBusy={isDealActionBusy}
                onAction={handleQuickAction}
              />
            )}

            <div className={styles.messagesArea}>
              {timeline.map((entry) => (
                <TimelineItem
                  key={
                    entry.kind === "date"
                      ? `date-${entry.label}`
                      : entry.data.id
                  }
                  entry={entry}
                />
              ))}
              {activeChat.isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <button
                type="button"
                className={styles.attachBtn}
                aria-label="Прикрепить файл"
              >
                <Paperclip />
              </button>
              <div className={styles.inputWrap}>
                <textarea
                  ref={textareaRef}
                  className={styles.textInput}
                  placeholder="Написать сообщение..."
                  value={inputText}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
              </div>
              <button
                type="button"
                className={styles.sendBtn}
                onClick={() => void handleSend()}
                disabled={!inputText.trim() || isSending}
              >
                <Send />
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyConversation}>
            <div className={styles.emptyIcon}>
              <MessageCircle />
            </div>
            <h3 className={styles.emptyTitle}>
              {isChatsLoading ? "Загружаем диалоги" : "Выберите диалог"}
            </h3>
            <p className={styles.emptyText}>
              {isChatsLoading
                ? "Получаем список чатов с backend"
                : "Выберите чат из списка слева, чтобы начать общение"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
