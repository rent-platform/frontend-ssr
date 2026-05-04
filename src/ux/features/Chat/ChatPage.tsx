'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  MessageCircle,
  Paperclip,
  Search,
  Send,
} from 'lucide-react';
import type { ChatListTab } from './types';
import { MOCK_CHATS, MOCK_TIMELINES, QUICK_ACTIONS } from './mockChatData';
import { ROUTES } from '@/ux/utils';
import { ChatListItem, ConversationHeader, DealContextBar, QuickActionsBar, TypingIndicator, TimelineItem } from './components';
import styles from './ChatPage.module.scss';

const TABS: { id: ChatListTab; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'renting_out', label: 'Сдаю' },
  { id: 'renting_in', label: 'Арендую' },
  { id: 'inquiries', label: 'Запросы' },
];

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
      const ta = a.lastMessage?.created_at ?? a.created_at;
      const tb = b.lastMessage?.created_at ?? b.created_at;
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
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Сообщения</h2>
          <div className={styles.sidebarActions}>
            <Link href={ROUTES.home} className={styles.sidebarBtn} aria-label="Назад">
              <ArrowLeft />
            </Link>
          </div>
        </div>

        <div className={styles.sidebarTabs}>
          <button
            type="button"
            className={`${styles.sidebarTab} ${tab === 'all' ? styles.sidebarTabActive : ''}`}
            onClick={() => setTab('all')}
          >
            Все
            {tabCounts.all > 0 && (
              <span className={`${styles.sidebarTabBadge} ${tab === 'all' ? styles.sidebarTabBadgeActive : ''}`}>
                {tabCounts.all}
              </span>
            )}
          </button>

          <div className={styles.tabDropdownWrap}>
            <button
              type="button"
              className={`${styles.sidebarTab} ${tab !== 'all' ? styles.sidebarTabActive : ''}`}
            >
              {tab !== 'all' ? TABS.find((t) => t.id === tab)?.label : 'Категория'}
              {tab !== 'all' && tabCounts[tab] > 0 && (
                <span className={`${styles.sidebarTabBadge} ${styles.sidebarTabBadgeActive}`}>
                  {tabCounts[tab]}
                </span>
              )}
              <ChevronDown size={13} className={styles.tabDropdownChevron} />
            </button>
            <div className={styles.tabDropdown}>
              {TABS.filter((t) => t.id !== 'all').map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.tabDropdownItem} ${tab === t.id ? styles.tabDropdownItemActive : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  <span>{t.label}</span>
                  {tabCounts[t.id] > 0 && (
                    <span className={styles.tabDropdownItemBadge}>{tabCounts[t.id]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.searchBox}>
          <div className={styles.searchWrap}>
            <Search />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Поиск по диалогам..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.chatList}>
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onClick={() => setActiveChatId(chat.id)}
              />
            ))
          ) : (
            <div className={styles.emptyListState}>
              <MessageCircle />
              <p className={styles.emptyListTitle}>Нет диалогов</p>
              <p className={styles.emptyListText}>
                {search ? 'Попробуйте изменить запрос' : 'В этой категории пока нет чатов'}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* ═══ Conversation ═══ */}
      <main className={styles.conversation}>
        {activeChat ? (
          <>
            <ConversationHeader chat={activeChat} />
            {activeChat.itemTitle && <DealContextBar chat={activeChat} />}
            {quickActions.length > 0 && <QuickActionsBar actions={quickActions} />}

            <div className={styles.messagesArea}>
              {timeline.map((entry, i) => (
                <TimelineItem key={i} entry={entry} />
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
