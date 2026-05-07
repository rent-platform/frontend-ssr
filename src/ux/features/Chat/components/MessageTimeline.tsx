'use client';

import { Check, CheckCheck, Shield } from 'lucide-react';
import clsx from 'clsx';
import { formatTime } from '@/ux/utils';
import type { QuickActionsBarProps, TimelineItemProps, MessageBubbleProps } from '../types';
import styles from '../ChatPage.module.scss';

/* ═══ Quick Actions Bar ═══ */

export function QuickActionsBar({ actions }: QuickActionsBarProps) {
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
          className={clsx(styles.qaBtn, variantCls[a.variant])}
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

export function TimelineItem({ entry }: TimelineItemProps) {
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

function MessageBubble({ message }: MessageBubbleProps) {
  const isOwn = message.isOwn;
  const time = formatTime(message.createdAt);

  return (
    <div className={clsx(styles.bubbleRow, isOwn && styles.own)}>
      <div className={clsx(styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther)}>
        {message.image && (
          <img src={message.image} alt="" className={styles.bubbleImage} />
        )}
        <p className={styles.bubbleText}>{message.text}</p>
        <div className={styles.bubbleMeta}>
          <span className={styles.bubbleTime}>{time}</span>
          {isOwn && (
            <span className={clsx(styles.bubbleCheck, message.readAt && styles.bubbleCheckRead)}>
              {message.readAt ? <CheckCheck /> : <Check />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
