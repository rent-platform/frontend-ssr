'use client';

import { Package, Pin } from 'lucide-react';
import { getInitials, timeAgo } from '@/ux/utils';
import type { ChatPreview } from '../types';
import { CURRENT_USER_ID } from '../types';
import styles from '../ChatPage.module.scss';

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  owner: { label: 'Сдаю', cls: styles.roleBadgeOwner },
  renter: { label: 'Арендую', cls: styles.roleBadgeRenter },
  inquiry: { label: 'Запрос', cls: styles.roleBadgeInquiry },
};

type ChatListItemProps = {
  chat: ChatPreview;
  isActive: boolean;
  onClick: () => void;
};

export function ChatListItem({ chat, isActive, onClick }: ChatListItemProps) {
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
    <button
      type="button"
      className={`${styles.chatItem} ${isActive ? styles.chatItemActive : ''}`}
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      aria-label={`Чат с ${chat.counterpartyName} — ${chat.itemTitle}`}
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
    </button>
  );
}
