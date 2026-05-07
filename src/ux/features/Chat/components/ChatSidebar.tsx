'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronDown, MessageCircle, Search } from 'lucide-react';
import clsx from 'clsx';
import { ROUTES } from '@/ux/utils';
import type { ChatListTab, ChatPreview } from '../types';
import { ChatListItem } from './ChatListItem';
import styles from '../ChatPage.module.scss';

const TABS: { id: ChatListTab; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'renting_out', label: 'Сдаю' },
  { id: 'renting_in', label: 'Арендую' },
  { id: 'inquiries', label: 'Запросы' },
];

export type ChatSidebarProps = {
  tab: ChatListTab;
  onTabChange: (tab: ChatListTab) => void;
  tabCounts: Record<ChatListTab, number>;
  search: string;
  onSearchChange: (value: string) => void;
  filteredChats: ChatPreview[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
};

export function ChatSidebar({
  tab,
  onTabChange,
  tabCounts,
  search,
  onSearchChange,
  filteredChats,
  activeChatId,
  onSelectChat,
}: ChatSidebarProps) {
  return (
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
          className={clsx(styles.sidebarTab, tab === 'all' && styles.sidebarTabActive)}
          onClick={() => onTabChange('all')}
        >
          Все
          {tabCounts.all > 0 && (
            <span className={clsx(styles.sidebarTabBadge, tab === 'all' && styles.sidebarTabBadgeActive)}>
              {tabCounts.all}
            </span>
          )}
        </button>

        <div className={styles.tabDropdownWrap}>
          <button
            type="button"
            className={clsx(styles.sidebarTab, tab !== 'all' && styles.sidebarTabActive)}
          >
            {tab !== 'all' ? TABS.find((t) => t.id === tab)?.label : 'Категория'}
            {tab !== 'all' && tabCounts[tab] > 0 && (
              <span className={clsx(styles.sidebarTabBadge, styles.sidebarTabBadgeActive)}>
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
                className={clsx(styles.tabDropdownItem, tab === t.id && styles.tabDropdownItemActive)}
                onClick={() => onTabChange(t.id)}
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
            onChange={(e) => onSearchChange(e.target.value)}
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
              onClick={() => onSelectChat(chat.id)}
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
  );
}
