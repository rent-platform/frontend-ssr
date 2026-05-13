'use client';

import {
  MessageCircle,
  Paperclip,
  Send,
} from 'lucide-react';
import { ChatSidebar, ConversationHeader, DealContextBar, QuickActionsBar, TypingIndicator, TimelineItem } from './components';
import { useChatPage } from './hooks/useChatPage';
import styles from './ChatPage.module.scss';

/* ═══════════════════════════════════════════════════════════════════════════════
   ChatPage
   ═══════════════════════════════════════════════════════════════════════════════ */
export function ChatPage() {
  const {
    activeChatId,
    setActiveChatId,
    search,
    setSearch,
    tab,
    setTab,
    inputText,
    textareaRef,
    messagesEndRef,
    activeChat,
    timeline,
    quickActions,
    filteredChats,
    tabCounts,
    handleInput,
    handleSend,
    handleKeyDown,
  } = useChatPage();

  return (
    <div className={styles.page}>
      {/* ═══ Sidebar ═══ */}
      <ChatSidebar
        tab={tab}
        onTabChange={setTab}
        tabCounts={tabCounts}
        search={search}
        onSearchChange={setSearch}
        filteredChats={filteredChats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
      />

      {/* ═══ Conversation ═══ */}
      <main className={styles.conversation}>
        {activeChat ? (
          <>
            <ConversationHeader chat={activeChat} />
            {activeChat.itemTitle && <DealContextBar chat={activeChat} />}
            {quickActions.length > 0 && <QuickActionsBar actions={quickActions} />}

            <div className={styles.messagesArea}>
              {timeline.map((entry) => (
                <TimelineItem
                  key={entry.kind === 'date' ? `date-${entry.label}` : entry.data.id}
                  entry={entry}
                />
              ))}
              {activeChat.isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <button type="button" className={styles.attachBtn} aria-label="Прикрепить файл">
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
                onClick={handleSend}
                disabled={!inputText.trim()}
              >
                <Send />
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyConversation}>
            <div className={styles.emptyIcon}><MessageCircle /></div>
            <h3 className={styles.emptyTitle}>Выберите диалог</h3>
            <p className={styles.emptyText}>
              Выберите чат из списка слева, чтобы начать общение
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
