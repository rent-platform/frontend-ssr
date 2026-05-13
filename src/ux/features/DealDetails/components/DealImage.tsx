'use client';

import clsx from 'clsx';
import { UI_DEAL_STATUS_LABEL, type UiDealStatus } from '@/ux/types/deal';
import { getStatusBadgeColor } from '../dealDetailsHelpers';
import styles from '../DealDetailsPage.module.scss';

interface DealImageProps {
  imageUrl: string;
  title: string;
  status: UiDealStatus;
}

export function DealImage({ imageUrl, title, status }: DealImageProps) {
  const badgeColor = getStatusBadgeColor(status);

  return (
    <div className={styles.imageWrap}>
      <img
        className={styles.image}
        src={imageUrl}
        alt={title}
        loading="eager"
      />
      <span
        className={clsx(
          styles.statusBadge,
          styles[`statusBadge--${badgeColor}`],
        )}
      >
        {UI_DEAL_STATUS_LABEL[status]}
      </span>
    </div>
  );
}
