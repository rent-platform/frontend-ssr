'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  CheckCheck,
  MessageCircle,
  Package,
  Search,
  Send,
  Shield,
} from 'lucide-react';
import type { ChatPreview, ChatMessage, TimelineEntry } from './types';
import { CURRENT_USER_ID } from './types';
import { MOCK_CHATS, MOCK_TIMELINES } from './mockChatData';
import styles from './ChatPage.module.scss';

/* ─── Helpers ─── */

function timeAgo(iso: string) {
  const now = Date.now();
  const d = new Date(iso).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'только что';
  if (diff < 3600) return `${Math.floor(diff / 60)} мин`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч`;
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2);
}

const DEAL_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  new: { label: 'Новая заявка', cls: styles.dealBadgeNew },
  confirmed: { label: 'Подтверждена', cls: styles.dealBadgeConfirmed },
  active: { label: 'Активна', cls: styles.dealBadgeActive },
  completed: { label: 'Завершена', cls: styles.dealBadgeCompleted },
  rejected: { label: 'Отклонена', cls: styles.dealBadgeRejected },
};

/* ═══════════════════════════════════════════════════════════════════════════════
   ChatPage
   ═══════════════════════════════════════════════════════════════════════════════ */
export function ChatPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
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

  const filteredChats = useMemo(() => {
    const q = search.toLowerCase().trim();
    const sorted = [...MOCK_CHATS].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const ta = a.lastMessage?.created_at ?? a.created_at;
      const tb = b.lastMessage?.created_at ?? b.created_at;
      return new Date(tb).getTime() - new Date(ta).getTime();
    });
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.counterpartyName.toLowerCase().includes(q) ||
        c.itemTitle.toLowerCase().includes(q) ||
        c.lastMessage?.text.toLowerCase().includes(q),
    );
  }, [search]);

  /* scroll to bottom on chat switch */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, timeline.length]);

  /* auto-resize textarea */
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    /* In real app: dispatch message via API / websocket */
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.page}>
      {/* ═══ Sidebar ═══ */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Сообщения</h2>
          <Link href="/dev-ui" className={styles.sidebarBackLink}>
            <ArrowLeft />
          </Link>
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
          {filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onClick={() => setActiveChatId(chat.id)}
            />
          ))}
        </div>
      </aside>

      {/* ═══ Conversation ═══ */}
      <main className={styles.conversation}>
        {activeChat ? (
          <>
            <ConversationHeader chat={activeChat} />
            {activeChat.itemTitle && <DealContextBar chat={activeChat} />}

            <div className={styles.messagesArea}>
              {timeline.map((entry, i) => (
                <TimelineItem key={i} entry={entry} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
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

/* ═══ ChatListItem ═══ */

function ChatListItem({
  chat,
  isActive,
  onClick,
}: {
  chat: ChatPreview;
  isActive: boolean;
  onClick: () => void;
}) {
  const initials = getInitials(chat.counterpartyName);
  const lastTime = chat.lastMessage ? timeAgo(chat.lastMessage.created_at) : '';
  const lastText = chat.lastMessage
    ? (chat.lastMessage.sender_id === CURRENT_USER_ID ? 'Вы: ' : '') + chat.lastMessage.text
    : 'Нет сообщений';

  return (
    <div
      className={`${styles.chatItem} ${isActive ? styles.chatItemActive : ''} ${chat.pinned ? styles.chatItemPinned : ''}`}
      onClick={onClick}
    >
      <div className={styles.chatAvatar}>
        {chat.counterpartyAvatar ? (
          <img src={chat.counterpartyAvatar} alt="" className={styles.chatAvatarImg} />
        ) : (
          <div className={styles.chatAvatarCircle}>{initials}</div>
        )}
        {chat.isOnline && <div className={styles.onlineDot} />}
      </div>

      <div className={styles.chatContent}>
        <div className={styles.chatTopRow}>
          <span className={styles.chatName}>{chat.counterpartyName}</span>
          <span className={styles.chatTime}>{lastTime}</span>
        </div>
        <div className={styles.chatBottomRow}>
          <span className={styles.chatLastMsg}>{lastText}</span>
          {chat.unreadCount > 0 && (
            <span className={styles.chatUnread}>{chat.unreadCount}</span>
          )}
        </div>
        <div className={styles.chatItemLine}>
          <Package size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
          {chat.itemTitle}
        </div>
      </div>
    </div>
  );
}

/* ═══ Conversation Header ═══ */

function ConversationHeader({ chat }: { chat: ChatPreview }) {
  const initials = getInitials(chat.counterpartyName);

  return (
    <div className={styles.convHeader}>
      <div className={styles.convAvatarWrap}>
        {chat.counterpartyAvatar ? (
          <img src={chat.counterpartyAvatar} alt="" className={styles.convAvatarImg} />
        ) : (
          <div className={styles.convAvatar}>{initials}</div>
        )}
        {chat.isOnline && <div className={styles.convOnline} />}
      </div>
      <div className={styles.convInfo}>
        <div className={styles.convName}>{chat.counterpartyName}</div>
        <div className={chat.isOnline ? `${styles.convStatus} ${styles.convStatusOnline}` : styles.convStatus}>
          {chat.isOnline ? 'В сети' : 'Не в сети'}
        </div>
      </div>
    </div>
  );
}

/* ═══ Deal Context Bar ═══ */

function DealContextBar({ chat }: { chat: ChatPreview }) {
  const badge = chat.dealStatus ? DEAL_STATUS_LABELS[chat.dealStatus] : null;

  return (
    <div className={styles.dealBar}>
      {chat.itemImage ? (
        <img src={chat.itemImage} alt="" className={styles.dealBarImg} />
      ) : (
        <div className={styles.dealBarPlaceholder}><Package /></div>
      )}
      <div className={styles.dealBarInfo}>
        <div className={styles.dealBarTitle}>{chat.itemTitle}</div>
        {chat.dealPrice && (
          <div className={styles.dealBarMeta}>{chat.dealPrice} ₽</div>
        )}
      </div>
      {badge && (
        <span className={`${styles.dealBadge} ${badge.cls}`}>{badge.label}</span>
      )}
    </div>
  );
}

/* ═══ Timeline Item ═══ */

function TimelineItem({ entry }: { entry: TimelineEntry }) {
  switch (entry.kind) {
    case 'date':
      return (
        <div className={styles.dateSeparator}>
          <span className={styles.dateLabel}>{entry.label}</span>
        </div>
      );
    case 'system':
      return (
        <div className={styles.systemEvent}>
          <span className={styles.systemEventText}>
            <Shield size={12} />
            {entry.data.text}
          </span>
        </div>
      );
    case 'message':
      return <MessageBubble message={entry.data} />;
  }
}

/* ═══ Message Bubble ═══ */

function MessageBubble({ message }: { message: ChatMessage }) {
  const isOwn = message.isOwn;
  const time = formatTime(message.created_at);

  return (
    <div className={`${styles.bubbleRow} ${isOwn ? styles.own : ''}`}>
      <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
        <p className={styles.bubbleText}>{message.text}</p>
        <div className={styles.bubbleMeta}>
          <span className={styles.bubbleTime}>{time}</span>
          {isOwn && (
            <span className={`${styles.bubbleCheck} ${message.readAt ? styles.bubbleCheckRead : ''}`}>
              {message.readAt ? <CheckCheck /> : <Check />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
