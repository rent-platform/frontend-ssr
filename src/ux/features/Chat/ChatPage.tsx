'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageCircle,
  Paperclip,
  Send,
} from 'lucide-react';
import type { ChatListTab } from './types';
import { MOCK_CHATS, MOCK_TIMELINES, QUICK_ACTIONS } from './mockChatData';
import { ChatSidebar, ConversationHeader, DealContextBar, QuickActionsBar, TypingIndicator, TimelineItem } from './components';
import styles from './ChatPage.module.scss';

/* ═══════════════════════════════════════════════════════════════════════════════
   ChatPage
   ═══════════════════════════════════════════════════════════════════════════════ */
export function ChatPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<ChatListTab>('all');
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = useMemo(
    () => MOCK_CHATS.find((c) => c.id === activeChatId) ?? null,
    [activeChatId],
  );

  const timeline = useMemo(
    () => (activeChatId ? MOCK_TIMELINES[activeChatId] ?? [] : []),
    [activeChatId],
  );

  const quickActions = useMemo(() => {
    if (!activeChat?.dealStatus || activeChat.myRole !== 'owner') return [];
    return QUICK_ACTIONS[activeChat.dealStatus] ?? [];
  }, [activeChat]);

  const filteredChats = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = MOCK_CHATS.filter((c) => !c.archived);

    if (tab === 'renting_out') list = list.filter((c) => c.myRole === 'owner');
    else if (tab === 'renting_in') list = list.filter((c) => c.myRole === 'renter');
    else if (tab === 'inquiries') list = list.filter((c) => c.myRole === 'inquiry');

    if (q) {
      list = list.filter(
        (c) =>
          c.counterpartyName.toLowerCase().includes(q) ||
          c.itemTitle.toLowerCase().includes(q) ||
          c.lastMessage?.text.toLowerCase().includes(q),
      );
    }

    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const ta = a.lastMessage?.createdAt ?? a.createdAt;
      const tb = b.lastMessage?.createdAt ?? b.createdAt;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
  }, [search, tab]);

  const tabCounts = useMemo(() => {
    const active = MOCK_CHATS.filter((c) => !c.archived);
    return {
      all: active.length,
      renting_out: active.filter((c) => c.myRole === 'owner').length,
      renting_in: active.filter((c) => c.myRole === 'renter').length,
      inquiries: active.filter((c) => c.myRole === 'inquiry').length,
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, timeline.length]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

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
