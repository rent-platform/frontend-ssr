'use client';

import { useState } from 'react';
import {
  Search,
  Check,
  X,
  Flag,
  Eye,
  Trash2,
  ShieldCheck,
  MessageSquare,
  ChevronLeft,
  AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';
import { useReviewsModeration } from '../hooks/useReviewsModeration';
import { usePagination } from '@/ux/hooks';
import { useSortable } from '@/ux/hooks';
import { formatDate, renderStars } from '../utils';
import type { ToastFn } from '@/ux/components/Toast';
import type { ModeratedReview } from '../types';
import { AdminSelect } from './AdminSelect';
import { TableSkeleton } from './TableSkeleton';
import { Pagination } from './Pagination';
import { SortableHeader } from './SortableHeader';

/* ── Sort config ──────────────────────────────────────────────────────── */

type ReviewSortKey = 'reviewer' | 'item' | 'rating' | 'flagged' | 'date';
const REVIEW_SORT_ACCESSORS: Partial<Record<ReviewSortKey, (r: ModeratedReview) => string | number | boolean | null | undefined>> = {
  reviewer: (r) => r.reviewerName,
  item: (r) => r.itemTitle,
  rating: (r) => r.rating,
  flagged: (r) => r.isFlagged,
  date: (r) => r.createdAt,
};

/* ── Component ─────────────────────────────────────────────────────────── */

export function ReviewsModerationTab({ toast }: { toast: ToastFn }) {
  const r = useReviewsModeration();
  const { sortedItems, sortKey, sortDirection, toggleSort } = useSortable<ModeratedReview, ReviewSortKey>(r.items, REVIEW_SORT_ACCESSORS);
  const pg = usePagination(sortedItems);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (r.isLoading) return <TableSkeleton />;

  return (
    <>
      {/* Toolbar */}
      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <div className={s.searchInput}>
            <Search size={16} />
            <input
              placeholder="Поиск по тексту, автору, объявлению..."
              value={r.filter.search}
              onChange={(e) => r.updateFilter({ search: e.target.value })}
            />
          </div>
          <AdminSelect
            value={r.filter.flagged}
            onChange={(v) => r.updateFilter({ flagged: v as any })}
            options={[
              { value: 'all', label: 'Все отзывы' },
              { value: 'flagged', label: `С флагом (${r.flaggedCount})` },
              { value: 'clean', label: 'Без флага' },
            ]}
          />
        </div>
        <div className={s.toolbarRight}>
          <span className={s.toolbarInfoText}>
            Всего: <strong>{r.totalCount}</strong> · С флагом: <strong>{r.flaggedCount}</strong>
          </span>
        </div>
      </div>

      {/* Detail view */}
      {r.selectedReview && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={clsx(s.detailPanel, s.detailPanelSpaced)}
        >
          <div className={s.detailHeader}>
            <button
              className={clsx(s.btn, s.btnGhost, s.btnSm)}
              onClick={() => r.setSelectedReview(null)}
            >
              <ChevronLeft size={16} /> Назад
            </button>
            {r.selectedReview.isFlagged && (
              <span className={clsx(s.badge, s.badgeRed)}>
                <Flag size={12} /> Флаг
              </span>
            )}
          </div>
          <div className={s.detailBody}>
            <div className={s.detailGrid}>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Автор</span>
                <span className={s.detailValue}>{r.selectedReview.reviewerName}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Объявление</span>
                <span className={s.detailValue}>{r.selectedReview.itemTitle}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Рейтинг</span>
                <span className={clsx(s.detailValue, s.starsRow)}>
                  {renderStars(r.selectedReview.rating)}
                </span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Дата</span>
                <span className={s.detailValue}>{formatDate(r.selectedReview.createdAt)}</span>
              </div>
            </div>
            {r.selectedReview.text && (
              <div className={s.detailSection}>
                <span className={s.detailLabel}>Текст отзыва</span>
                <p className={s.detailText}>
                  {r.selectedReview.text}
                </p>
              </div>
            )}
            {r.selectedReview.flagReason && (
              <div className={s.flagReasonBox}>
                <span className={s.detailLabel}>Причина флага</span>
                <p className={s.detailText}>{r.selectedReview.flagReason}</p>
              </div>
            )}
          </div>
          <div className={s.detailActions}>
            {r.selectedReview.isFlagged && (
              <button
                className={clsx(s.btn, s.btnPrimary)}
                onClick={() => { r.clearFlag(r.selectedReview!.id); toast('Флаг снят'); }}
              >
                <ShieldCheck size={14} /> Снять флаг
              </button>
            )}
            <button
              className={clsx(s.btn, s.btnDanger)}
              onClick={() => setDeleteConfirmId(r.selectedReview!.id)}
            >
              <Trash2 size={14} /> Удалить отзыв
            </button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      {!r.selectedReview && (
        <div className={s.card}>
          <div className={s.tableWrapper}>
            <table className={clsx(s.table, s.tableZebra)}>
              <thead>
                <tr>
                  <SortableHeader label="Автор" sortKey="reviewer" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Объявление" sortKey="item" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Рейтинг" sortKey="rating" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <th>Текст</th>
                  <SortableHeader label="Флаг" sortKey="flagged" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Дата" sortKey="date" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {r.items.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className={s.emptyPanel}>
                        <div className={s.emptyIcon}><MessageSquare size={28} /></div>
                        <div className={s.emptyTitle}>Отзывов нет</div>
                        <div className={s.emptyText}>Нет отзывов по заданным фильтрам</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pg.paginatedItems.map((rev) => (
                    <tr key={rev.id}>
                      <td className={s.cellBold}>{rev.reviewerName}</td>
                      <td className={s.cellTruncate160}>{rev.itemTitle}</td>
                      <td>
                        <div className={s.starsRow}>{renderStars(rev.rating)}</div>
                      </td>
                      <td className={s.cellTruncate200}>{rev.text ?? '—'}</td>
                      <td>
                        {rev.isFlagged ? (
                          <span className={clsx(s.badge, s.badgeRed)}><Flag size={10} /> Да</span>
                        ) : (
                          <span className={clsx(s.badge, s.badgeGreen)}>Нет</span>
                        )}
                      </td>
                      <td className={s.cellNoWrap}>{formatDate(rev.createdAt)}</td>
                      <td>
                        <div className={s.flexRowTight}>
                          <button
                            className={clsx(s.btn, s.btnGhost, s.btnSm)}
                            title="Подробнее"
                            onClick={() => r.setSelectedReview(rev)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className={clsx(s.btn, s.btnDanger, s.btnSm)}
                            title="Удалить"
                            onClick={() => setDeleteConfirmId(rev.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pg} />
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            className={s.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              className={s.modalPanel}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={s.modalHeader}>
                <h3 className={s.modalTitle}>Удаление отзыва</h3>
                <button className={s.modalClose} onClick={() => setDeleteConfirmId(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className={s.confirmWarning}>
                <AlertTriangle size={16} className={s.confirmWarningIcon} />
                <span>Это действие необратимо. Отзыв будет удалён навсегда.</span>
              </div>
              <p className={s.confirmBody}>Вы уверены, что хотите удалить этот отзыв?</p>
              <div className={s.modalFooter}>
                <button className={clsx(s.btn, s.btnGhost)} onClick={() => setDeleteConfirmId(null)}>
                  Отмена
                </button>
                <button
                  className={clsx(s.btn, s.btnDanger)}
                  onClick={() => {
                    r.deleteReview(deleteConfirmId);
                    toast('Отзыв удалён');
                    setDeleteConfirmId(null);
                  }}
                >
                  <Trash2 size={14} /> Удалить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
