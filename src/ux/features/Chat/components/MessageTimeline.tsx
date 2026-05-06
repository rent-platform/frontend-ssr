'use client';

import { Check, CheckCheck, Shield } from 'lucide-react';
import { formatTime } from '@/ux/utils';
import type { ChatMessage, TimelineEntry, QuickAction } from '../types';
import styles from '../ChatPage.module.scss';

/* ═══ Quick Actions Bar ═══ */

export function QuickActionsBar({ actions }: { actions: QuickAction[] }) {
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

export function TypingIndicator() {
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

export function TimelineItem({ entry }: { entry: TimelineEntry }) {
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
  const time = formatTime(message.createdAt);

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
