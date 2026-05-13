'use client';

import type { DealParticipantInfo } from '../types';
import styles from '../DealDetailsPage.module.scss';

interface DealParticipantProps {
  participant: DealParticipantInfo;
}

export function DealParticipant({ participant }: DealParticipantProps) {
  const roleLabel = participant.role === 'owner' ? 'Арендодатель' : 'Арендатор';

  return (
    <div className={styles.participant}>
      <div
        className={styles.participantAvatar}
        style={{ background: participant.avatarColor }}
      >
        {participant.initial}
      </div>
      <div className={styles.participantInfo}>
        <span className={styles.participantRole}>{roleLabel}</span>
        <span className={styles.participantName}>{participant.name}</span>
      </div>
    </div>
  );
}
