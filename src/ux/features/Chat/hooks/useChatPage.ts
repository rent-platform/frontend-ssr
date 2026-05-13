import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChatListTab, ChatPreview, QuickAction, TimelineEntry } from '../types';
import { MOCK_CHATS, MOCK_TIMELINES, OWNER_ACTIONS, RENTER_ACTIONS } from '../mockChatData';

export function useChatPage() {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<ChatListTab>('all');
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat: ChatPreview | null = useMemo(
    () => MOCK_CHATS.find((c) => c.id === activeChatId) ?? null,
    [activeChatId],
  );

  const timeline: TimelineEntry[] = useMemo(
    () => (activeChatId ? MOCK_TIMELINES[activeChatId] ?? [] : []),
    [activeChatId],
  );

  const quickActions: QuickAction[] = useMemo(() => {
    if (!activeChat?.dealStatus || activeChat.myRole === 'inquiry') return [];
    const actionsMap = activeChat.myRole === 'owner' ? OWNER_ACTIONS : RENTER_ACTIONS;
    return actionsMap[activeChat.dealStatus] ?? [];
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

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [inputText]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return {
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
  };
}
