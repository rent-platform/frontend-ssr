'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import {
  AlertTriangle,
  Archive,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  CreditCard,
  Hash,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Star,
  Tag,
  User,
  X,
  XCircle,
} from 'lucide-react';
import type { AdminListing } from '../types';
import { formatDate, formatPriceNum } from '@/ux/utils';
import { AdminGallery } from './AdminGallery';
import styles from './AdminListingDetail.module.scss';

/* ── Status config ─────────────────────────────────────────────────────── */

type StatusInfo = { label: string; cls: string; icon: React.ReactNode; description: string };
const STATUS_MAP: Record<string, StatusInfo> = {
  ACTIVE:     { label: 'Активно',      cls: styles.statusActive,     icon: <CheckCircle2 size={14} />, description: 'Объявление видно в каталоге' },
  MODERATION: { label: 'На модерации', cls: styles.statusModeration, icon: <Clock size={14} />,        description: 'Ожидает проверки модератором' },
  REJECTED:   { label: 'Отклонено',    cls: styles.statusRejected,   icon: <XCircle size={14} />,      description: 'Не прошло модерацию' },
  ARCHIVED:   { label: 'Архив',        cls: styles.statusArchived,   icon: <Archive size={14} />,      description: 'Снято с публикации' },
  DRAFT:      { label: 'Черновик',     cls: styles.statusDraft,      icon: <Hash size={14} />,         description: 'Не опубликовано' },
};

/* ── Helpers ───────────────────────────────────────────────────────────── */

const fmtPrice = (v: number | null | undefined) => !v ? '—' : formatPriceNum(v);

function getDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ── Props ─────────────────────────────────────────────────────────────── */

export type AdminListingDetailProps = {
  listing: AdminListing;
  onBack: () => void;
  onArchive: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, comment: string) => void;
  onRestore: (id: string) => void;
  onSendToModeration: (id: string) => void;
};

/* ── Component ─────────────────────────────────────────────────────────── */

export function AdminListingDetail({
  listing,
  onBack,
  onArchive,
  onApprove,
  onReject,
  onRestore,
  onSendToModeration,
}: AdminListingDetailProps) {
  const statusInfo = STATUS_MAP[listing.status] ?? { label: listing.status, cls: '', icon: null, description: '' };

  const [rejectComment, setRejectComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'archive' | 'restore' | null>(null);

  const images = useMemo(() => {
    const photos = listing.photos ?? [];
    const mainPhoto = listing.mainPhotoUrl ?? photos[0]?.photoUrl ?? '';
    if (photos.length > 0) {
      return [...photos].sort((a, b) => a.sortOrder - b.sortOrder).map((p) => p.photoUrl);
    }
    return mainPhoto ? [mainPhoto] : [];
  }, [listing]);

  const handleRejectSubmit = useCallback(() => {
    if (!rejectComment.trim()) return;
    onReject(listing.id, rejectComment.trim());
    setRejectComment('');
    setShowRejectForm(false);
  }, [listing.id, rejectComment, onReject]);

  const handleConfirmAction = useCallback(() => {
    if (confirmAction === 'approve') onApprove(listing.id);
    else if (confirmAction === 'archive') onArchive(listing.id);
    else if (confirmAction === 'restore') onRestore(listing.id);
    setConfirmAction(null);
  }, [confirmAction, listing.id, onApprove, onArchive, onRestore]);

  return (
    <div className={styles.wrapper}>
      {/* ═══════════════════════════════════════════════════════════════════════
         ADMIN TOP BAR
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.adminBar}>
        <button className={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={16} /> Назад к списку
        </button>
        <div className={styles.adminBarRight}>
          <div className={clsx(styles.statusPill, statusInfo.cls)}>
            {statusInfo.icon}
            <span>{statusInfo.label}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
         MODERATION BANNER (for rejected items)
         ═══════════════════════════════════════════════════════════════════════ */}
      {listing.moderationComment && (
        <motion.div
          className={styles.moderationBanner}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.moderationBannerIcon}>
            <AlertTriangle size={18} />
          </div>
          <div className={styles.moderationBannerContent}>
            <strong>Причина отклонения</strong>
            <p>{listing.moderationComment}</p>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
         MODERATION PANEL (for items awaiting moderation)
         ═══════════════════════════════════════════════════════════════════════ */}
      {listing.status === 'MODERATION' && (
        <motion.div
          className={styles.moderationPanel}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.moderationPanelHeader}>
            <div className={styles.moderationPanelIcon}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3>Модерация объявления</h3>
              <p>Проверьте содержание, фотографии и ценообразование</p>
            </div>
          </div>

          {!showRejectForm ? (
            <div className={styles.moderationActions}>
              <button
                className={styles.approveBtn}
                onClick={() => setConfirmAction('approve')}
              >
                <Check size={16} /> Одобрить и опубликовать
              </button>
              <button
                className={styles.rejectBtn}
                onClick={() => setShowRejectForm(true)}
              >
                <X size={16} /> Отклонить
              </button>
            </div>
          ) : (
            <div className={styles.rejectForm}>
              <label className={styles.rejectFormLabel}>
                <MessageSquare size={14} />
                Причина отклонения
              </label>
              <textarea
                className={styles.rejectFormTextarea}
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Укажите причину отклонения объявления..."
                rows={3}
                autoFocus
              />
              <div className={styles.rejectFormActions}>
                <button
                  className={styles.rejectFormCancel}
                  onClick={() => { setShowRejectForm(false); setRejectComment(''); }}
                >
                  Отмена
                </button>
                <button
                  className={styles.rejectFormSubmit}
                  onClick={handleRejectSubmit}
                  disabled={!rejectComment.trim()}
                >
                  <Send size={14} /> Отклонить
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
         MAIN CONTENT GRID
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.contentGrid}>

        {/* ── Left column: Gallery + Description ── */}
        <div className={styles.contentLeft}>
          <AdminGallery images={images} title={listing.title} />

          <div className={styles.listingHeader}>
            <h1 className={styles.listingTitle}>{listing.title}</h1>
            <div className={styles.listingMeta}>
              {listing.category?.categoryName && (
                <span className={styles.listingMetaItem}>
                  <Tag size={14} />
                  {listing.category.categoryName}
                </span>
              )}
              {listing.city && (
                <span className={styles.listingMetaItem}>
                  <MapPin size={14} />
                  {listing.city}
                </span>
              )}
              {listing.createdAt && (
                <span className={styles.listingMetaItem}>
                  <Calendar size={14} />
                  {formatDate(listing.createdAt, 'long')}
                </span>
              )}
            </div>
          </div>

          {listing.itemDescription && (
            <div className={styles.descriptionCard}>
              <h3 className={styles.descriptionTitle}>Описание</h3>
              <p className={styles.descriptionText}>{listing.itemDescription}</p>
            </div>
          )}
        </div>

        {/* ── Right column: Stats + Pricing + Quick info ── */}
        <div className={styles.contentRight}>

          {/* ── Pricing card ── */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <div className={clsx(styles.cardIcon, styles.cardIconGreen)}>
                <CreditCard size={16} />
              </div>
              <h3 className={styles.cardTitle}>Ценообразование</h3>
            </div>
            <div className={styles.fieldList}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Цена / сутки</span>
                <span className={styles.fieldValuePrice}>{fmtPrice(listing.pricePerDay)}</span>
              </div>
              {listing.pricePerHour != null && (
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Цена / час</span>
                  <span className={styles.fieldValueBold}>{fmtPrice(listing.pricePerHour)}</span>
                </div>
              )}
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Залог</span>
                <span className={styles.fieldValueBold}>{fmtPrice(listing.depositAmount)}</span>
              </div>
            </div>
          </div>

          {/* ── Owner card ── */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <div className={clsx(styles.cardIcon, styles.cardIconAmber)}>
                <User size={16} />
              </div>
              <h3 className={styles.cardTitle}>Владелец</h3>
            </div>

            <div className={styles.ownerCard}>
              <div className={styles.ownerAvatarWrap}>
                <div className={styles.ownerAvatar}>
                  {listing.owner?.avatarUrl ? (
                    <img src={listing.owner.avatarUrl} alt={listing.ownerName} />
                  ) : (
                    <span>{listing.ownerName.charAt(0)}</span>
                  )}
                </div>
              </div>
              <div className={styles.ownerInfo}>
                <span className={styles.ownerName}>{listing.ownerName}</span>
                <div className={styles.ownerMeta}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{(listing.owner?.rating ?? 0).toFixed(1)}</span>
                  <span className={styles.ownerMetaDivider}>·</span>
                  <Phone size={12} />
                  <span>{listing.ownerPhone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
         SERVICE INFO PANEL
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.adminPanel}>
        <h2 className={styles.panelTitle}>Служебная информация</h2>

        <div className={styles.serviceColumns}>
          {/* ── Left column ── */}
          <div className={styles.serviceSection}>
            <div className={styles.serviceRow}>
              <div className={styles.serviceRowIcon}><Hash size={14} /></div>
              <span className={styles.serviceLabel}>ID объявления</span>
              <span className={styles.fieldValueMono}>{listing.id}</span>
            </div>
            <div className={styles.serviceRow}>
              <div className={styles.serviceRowIcon}><User size={14} /></div>
              <span className={styles.serviceLabel}>ID владельца</span>
              <span className={styles.fieldValueMono}>{listing.ownerId ?? '—'}</span>
            </div>
            <div className={styles.serviceRow}>
              <div className={styles.serviceRowIcon}><Tag size={14} /></div>
              <span className={styles.serviceLabel}>Категория</span>
              <span className={styles.serviceValue}>{listing.category?.categoryName ?? '—'}</span>
            </div>
            <div className={styles.serviceRow}>
              <div className={styles.serviceRowIcon}><MapPin size={14} /></div>
              <span className={styles.serviceLabel}>Город</span>
              <span className={styles.serviceValue}>{listing.city ?? '—'}</span>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className={styles.serviceSection}>
            <div className={styles.serviceRow}>
              <div className={clsx(styles.serviceRowIcon, styles.serviceRowIconStatus)}>
                {statusInfo.icon}
              </div>
              <span className={styles.serviceLabel}>Статус</span>
              <div className={clsx(styles.statusPillSm, statusInfo.cls)}>
                <span>{statusInfo.label}</span>
              </div>
            </div>
            <div className={styles.serviceRow}>
              <div className={styles.serviceRowIcon}><Calendar size={14} /></div>
              <span className={styles.serviceLabel}>Создано</span>
              <span className={styles.serviceValue}>
                {listing.createdAt ? getDateLabel(listing.createdAt) : '—'}
              </span>
            </div>
            {listing.updatedAt && (
              <div className={styles.serviceRow}>
                <div className={styles.serviceRowIcon}><RefreshCw size={14} /></div>
                <span className={styles.serviceLabel}>Обновлено</span>
                <span className={styles.serviceValue}>{getDateLabel(listing.updatedAt)}</span>
              </div>
            )}
            <div className={styles.serviceRow}>
              <div className={clsx(
                styles.serviceRowIcon,
                listing.isAvailable ? styles.serviceRowIconGreen : styles.serviceRowIconRed,
              )}>
                {listing.isAvailable ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
              </div>
              <span className={styles.serviceLabel}>Доступность</span>
              <span className={clsx(
                styles.serviceValue,
                listing.isAvailable ? styles.serviceValueGreen : styles.serviceValueRed,
              )}>
                {listing.isAvailable ? 'Доступно' : 'Недоступно'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
         ADMIN ACTIONS (status-dependent)
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.actionsPanel}>
        <h2 className={styles.panelTitle}>Действия администратора</h2>

        <div className={styles.actionsGrid}>
          {listing.status === 'ACTIVE' && (
            <button
              className={styles.actionBtnDanger}
              onClick={() => setConfirmAction('archive')}
            >
              <Archive size={16} /> Принудительно снять объявление
            </button>
          )}

          {listing.status === 'ARCHIVED' && (
            <button
              className={styles.actionBtnSuccess}
              onClick={() => setConfirmAction('restore')}
            >
              <RotateCcw size={16} /> Восстановить объявление
            </button>
          )}

          {listing.status === 'REJECTED' && (
            <>
              <button
                className={styles.actionBtnPrimary}
                onClick={() => onSendToModeration(listing.id)}
              >
                <RefreshCw size={16} /> Отправить на повторную модерацию
              </button>
              <button
                className={styles.actionBtnSuccess}
                onClick={() => setConfirmAction('approve')}
              >
                <Check size={16} /> Одобрить и опубликовать
              </button>
            </>
          )}

          {listing.status === 'DRAFT' && (
            <button
              className={styles.actionBtnPrimary}
              onClick={() => onSendToModeration(listing.id)}
            >
              <Send size={16} /> Отправить на модерацию
            </button>
          )}

          {listing.status === 'MODERATION' && (
            <button
              className={styles.actionBtnDanger}
              onClick={() => setConfirmAction('archive')}
            >
              <Archive size={16} /> Снять без публикации
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
         CONFIRM ACTION MODAL
         ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              className={styles.modalPanel}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>
                  {confirmAction === 'approve' && 'Одобрить объявление'}
                  {confirmAction === 'archive' && 'Снять объявление'}
                  {confirmAction === 'restore' && 'Восстановить объявление'}
                </h3>
                <button className={styles.modalClose} onClick={() => setConfirmAction(null)}>
                  <X size={18} />
                </button>
              </div>

              <p className={styles.modalBody}>
                {confirmAction === 'approve' && (
                  <>Объявление «{listing.title}» будет одобрено и станет видимым в каталоге.</>
                )}
                {confirmAction === 'archive' && (
                  <>Объявление «{listing.title}» будет перемещено в архив и скрыто из каталога.</>
                )}
                {confirmAction === 'restore' && (
                  <>Объявление «{listing.title}» будет восстановлено и снова появится в каталоге.</>
                )}
              </p>

              <div className={styles.modalFooter}>
                <button className={styles.modalCancelBtn} onClick={() => setConfirmAction(null)}>
                  Отмена
                </button>
                <button
                  className={clsx(
                    styles.modalConfirmBtn,
                    confirmAction === 'archive' && styles.modalConfirmBtnDanger,
                    confirmAction === 'approve' && styles.modalConfirmBtnSuccess,
                    confirmAction === 'restore' && styles.modalConfirmBtnSuccess,
                  )}
                  onClick={handleConfirmAction}
                >
                  {confirmAction === 'approve' && <><Check size={14} /> Одобрить</>}
                  {confirmAction === 'archive' && <><Archive size={14} /> Снять</>}
                  {confirmAction === 'restore' && <><RotateCcw size={14} /> Восстановить</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
