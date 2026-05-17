import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Award,
  BadgeCheck,
  Calendar,
  Check,
  CheckCircle2,
  Flag,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Star,
} from 'lucide-react';
import clsx from 'clsx';
import { pluralize, formatDate, ROUTES, EASE } from '@/ux/utils';
import { TRUST_LABELS } from '../publicProfileHelpers';
import type { PublicUser } from '../types';
import styles from '../PublicProfile.module.scss';

export type UserSidebarProps = {
  user: PublicUser;
  initials: string;
  reported: boolean;
  onShareClick: () => void;
  onReportClick: () => void;
};

export function UserSidebar({ user, initials, reported, onShareClick, onReportClick }: UserSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <motion.div
        className={styles.userCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className={styles.avatarWrap}>
          <div className={styles.avatarRing}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarFallback}>{initials}</div>
            )}
          </div>
          {user.lastOnline === 'Онлайн' && <div className={styles.onlineDot} />}
        </div>

        <div className={styles.userName}>
          <h1>{user.fullName}</h1>
          {user.isVerified && <BadgeCheck size={18} className={styles.verifiedIcon} />}
        </div>
        {user.nickname && <span className={styles.userNickname}>@{user.nickname}</span>}

        {user.trustLevel === 'super' && (
          <div className={clsx(styles.trustBadge, styles.tooltipWrap)}>
            <Award size={14} />
            {TRUST_LABELS[user.trustLevel]}
            <span className={styles.tooltipBubble}>Надёжный арендодатель с высоким рейтингом</span>
          </div>
        )}

        <div className={styles.quickStats}>
          <div className={clsx(styles.quickStat, styles.tooltipWrap)}>
            <Star size={14} fill="currentColor" className={styles.starFilled} />
            <strong>{user.rating.toFixed(1)}</strong>
            <span className={styles.tooltipBubble}>Средняя оценка от арендаторов</span>
          </div>
          <span className={styles.quickStatSep} />
          <div className={clsx(styles.quickStat, styles.tooltipWrap)}>
            <strong>{user.reviewCount}</strong>
            <span>{pluralize(user.reviewCount, 'отзыв', 'отзыва', 'отзывов')}</span>
            <span className={styles.tooltipBubble}>Количество отзывов от пользователей</span>
          </div>
        </div>

        <Link href={ROUTES.chat} className={styles.ctaBtn}>
          <MessageCircle size={16} />
          Написать сообщение
        </Link>

        <div className={styles.secondaryActions}>
          <button type="button" className={styles.iconBtn} title="Поделиться" aria-label="Поделиться" onClick={onShareClick}>
            <Share2 size={15} />
          </button>
          <button
            type="button"
            className={clsx(styles.reportBtn, reported && styles.reportBtnDone)}
            onClick={onReportClick}
            disabled={reported}
          >
            {reported ? <><Check size={14} /> Жалоба отправлена</> : <><Flag size={14} /> Пожаловаться</>}
          </button>
        </div>
      </motion.div>

      <motion.div
        className={styles.infoCard}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: EASE }}
      >
        <h3 className={styles.infoCardTitle}>
          <ShieldCheck size={16} />
          Подтверждения
        </h3>
        <ul className={styles.verifyList}>
          {user.isVerified && (
            <li className={clsx(styles.verifyItem, styles.tooltipWrap)}>
              <CheckCircle2 size={15} />
              Личность подтверждена
              <span className={styles.tooltipBubble}>Паспорт проверен модератором</span>
            </li>
          )}
          <li className={clsx(styles.verifyItem, styles.tooltipWrap)}>
            <CheckCircle2 size={15} />
            Номер телефона
            <span className={styles.tooltipBubble}>Телефон подтверждён по SMS</span>
          </li>
          <li className={clsx(styles.verifyItem, styles.tooltipWrap)}>
            <CheckCircle2 size={15} />
            Электронная почта
            <span className={styles.tooltipBubble}>Email подтверждён</span>
          </li>
        </ul>
      </motion.div>

      <motion.div
        className={styles.infoCard}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease: EASE }}
      >
        <h3 className={styles.infoCardTitle}>О пользователе</h3>
        <div className={styles.aboutList}>
          <div className={styles.aboutRow}>
            <MapPin size={15} />
            <span>{user.city}</span>
          </div>
          <div className={styles.aboutRow}>
            <Calendar size={15} />
            <span>На платформе с {formatDate(user.memberSince, 'long')}</span>
          </div>
        </div>
      </motion.div>
    </aside>
  );
}
