'use client';

import { MessageSquare } from 'lucide-react';
import type { UiDealStatus } from '@/ux/types/deal';
import type { DealViewMode } from '../types';
import { getDealActions } from '../dealDetailsHelpers';
import styles from '../DealDetailsPage.module.scss';

interface DealActionsProps {
  status: UiDealStatus;
  viewMode: DealViewMode;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onChat?: () => void;
}

export function DealActions({ status, viewMode, onPrimary, onSecondary, onChat }: DealActionsProps) {
  const config = getDealActions(status, viewMode);

  return (
    <div className={styles.actions}>
      {config.primary && (
        <button className={styles.btnGreen} onClick={onPrimary}>
          {config.primary.label}
        </button>
      )}

      {config.secondary && (
        <button className={styles.btnDanger} onClick={onSecondary}>
          {config.secondary.label}
        </button>
      )}

      {config.showChat && (
        <button className={styles.btnChat} onClick={onChat}>
          <MessageSquare size={16} />
          Открыть чат
        </button>
      )}
    </div>
  );
}
