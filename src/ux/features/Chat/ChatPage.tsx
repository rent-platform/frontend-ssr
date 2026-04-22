'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCheck,
  MessageCircle,
  Package,
  Paperclip,
  Pin,
  Search,
  Send,
  Shield,
} from 'lucide-react';
import type { ChatPreview, ChatMessage, ChatListTab, TimelineEntry, QuickAction } from './types';
import { CURRENT_USER_ID } from './types';
import { MOCK_CHATS, MOCK_TIMELINES, QUICK_ACTIONS } from './mockChatData';
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

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${s.toLocaleDateString('ru-RU', opts)} — ${e.toLocaleDateString('ru-RU', opts)}`;
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

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  owner: { label: 'Сдаю', cls: styles.roleBadgeOwner },
  renter: { label: 'Арендую', cls: styles.roleBadgeRenter },
  inquiry: { label: 'Запрос', cls: styles.roleBadgeInquiry },
};

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
            <Link href="/dev-ui" className={styles.sidebarBtn} aria-label="Назад">
              <ArrowLeft />
            </Link>
          </div>
        </div>

        <div className={styles.sidebarTabs}>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.sidebarTab} ${tab === t.id ? styles.sidebarTabActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {tabCounts[t.id] > 0 && (
                <span className={`${styles.sidebarTabBadge} ${tab === t.id ? styles.sidebarTabBadgeActive : ''}`}>
                  {tabCounts[t.id]}
                </span>
              )}
            </button>
          ))}
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
  const role = ROLE_LABELS[chat.myRole];

  let lastText: string;
  if (chat.isTyping) {
    lastText = 'печатает…';
  } else if (chat.lastMessage) {
    lastText = (chat.lastMessage.sender_id === CURRENT_USER_ID ? 'Вы: ' : '') + chat.lastMessage.text;
  } else {
    lastText = 'Нет сообщений';
  }

  return (
    <div
      className={`${styles.chatItem} ${isActive ? styles.chatItemActive : ''}`}
      onClick={onClick}
    >
      {chat.pinned && (
        <div className={styles.pinIcon}><Pin size={10} /></div>
      )}

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
          <span className={`${styles.chatLastMsg} ${chat.isTyping ? styles.typingText : ''}`}>
            {lastText}
          </span>
          {chat.unreadCount > 0 && (
            <span className={styles.chatUnread}>{chat.unreadCount}</span>
          )}
        </div>
        <div className={styles.chatItemLine}>
          <Package size={11} />
          <span className={styles.chatItemLineText}>{chat.itemTitle}</span>
          {role && (
            <span className={`${styles.chatRoleBadge} ${role.cls}`}>{role.label}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ Conversation Header ═══ */

function ConversationHeader({ chat }: { chat: ChatPreview }) {
  const initials = getInitials(chat.counterpartyName);

  let statusText: string;
  let statusCls: string;
  if (chat.isTyping) {
    statusText = 'печатает…';
    statusCls = `${styles.convStatus} ${styles.convStatusTyping}`;
  } else if (chat.isOnline) {
    statusText = 'В сети';
    statusCls = `${styles.convStatus} ${styles.convStatusOnline}`;
  } else {
    statusText = 'Не в сети';
    statusCls = styles.convStatus;
  }

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
        <div className={statusCls}>{statusText}</div>
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
        <div className={styles.dealBarMeta}>
          {chat.dealPrice && <span>{chat.dealPrice} ₽/сутки</span>}
          {chat.dealDates && (
            <span>
              <Calendar size={10} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 2 }} />
              {formatDateRange(chat.dealDates.start, chat.dealDates.end)}
            </span>
          )}
          {chat.dealDeposit && <span>Залог {chat.dealDeposit} ₽</span>}
        </div>
      </div>
      {badge && (
        <span className={`${styles.dealBadge} ${badge.cls}`}>{badge.label}</span>
      )}
    </div>
  );
}

/* ═══ Quick Actions Bar ═══ */

function QuickActionsBar({ actions }: { actions: QuickAction[] }) {
  const variantCls: Record<string, string> = {
    primary: styles.qaBtnPrimary,
    secondary: styles.qaBtnSecondary,
    danger: styles.qaBtnDanger,
  };

  return (
    <div className={styles.quickActions}>
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          className={`${styles.qaBtn} ${variantCls[a.variant] ?? ''}`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

/* ═══ Typing Indicator ═══ */

function TypingIndicator() {
  return (
    <div className={styles.typingIndicator}>
      <div className={styles.typingDots}>
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </div>
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
            <Shield size={11} />
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
        {message.image && (
          <img src={message.image} alt="" className={styles.bubbleImage} />
        )}
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
