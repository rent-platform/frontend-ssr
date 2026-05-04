'use client';

import { getInitials } from '@/ux/utils';
import type { ChatPreview } from '../types';
import styles from '../ChatPage.module.scss';

export function ConversationHeader({ chat }: { chat: ChatPreview }) {
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
