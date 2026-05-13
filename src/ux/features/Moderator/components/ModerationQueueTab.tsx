'use client';

import { useState } from 'react';
import {
  Search,
  Check,
  X,
  Eye,
  ShieldCheck,
  ChevronLeft,
  MapPin,
  Camera,
  Banknote,
  User,
  Image,
  Timer,
} from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';
import { useModerationQueue } from '../hooks/useModerationQueue';
import { usePagination } from '../../Admin/hooks/usePagination';
import { useSortable } from '../../Admin/hooks/useSortable';
import { formatDate, formatPrice, getWaitingTime } from '../utils';
import type { ToastFn } from './Toast';
import type { ModerationQueueItem } from '../types';
import { AdminSelect } from './AdminSelect';
import { TableSkeleton } from './TableSkeleton';
import { Pagination } from './Pagination';
import { SortableHeader } from './SortableHeader';
import { Clock } from 'lucide-react';

/* ── Sort config ──────────────────────────────────────────────────────── */

type QueueSortKey = 'title' | 'category' | 'city' | 'price' | 'owner';
const QUEUE_SORT_ACCESSORS: Partial<Record<QueueSortKey, (i: ModerationQueueItem) => string | number | null | undefined>> = {
  title: (i) => i.title,
  category: (i) => i.category?.categoryName ?? '',
  city: (i) => i.city ?? '',
  price: (i) => i.pricePerDay,
  owner: (i) => i.ownerName,
};

/* ── Component ─────────────────────────────────────────────────────────── */

export function ModerationQueueTab({ toast }: { toast: ToastFn }) {
  const q = useModerationQueue();
  const { sortedItems, sortKey, sortDirection, toggleSort } = useSortable<ModerationQueueItem, QueueSortKey>(q.items, QUEUE_SORT_ACCESSORS);
  const pg = usePagination(sortedItems);

  if (q.isLoading) return <TableSkeleton />;

  return (
    <>
      {/* Toolbar */}
      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <div className={s.searchInput}>
            <Search size={16} />
            <input
              placeholder="Поиск по названию, городу, владельцу..."
              value={q.filter.search}
              onChange={(e) => q.updateFilter({ search: e.target.value })}
            />
          </div>
          <AdminSelect
            value={q.filter.sortBy}
            onChange={(v) => q.updateFilter({ sortBy: v as 'newest' | 'oldest' })}
            options={[
              { value: 'newest', label: 'Сначала новые' },
              { value: 'oldest', label: 'Сначала старые' },
            ]}
          />
        </div>
        <div className={s.toolbarRight}>
          <span className={s.toolbarInfoText}>
            Всего: <strong>{q.allCount}</strong>
          </span>
        </div>
      </div>

      {/* Detail view */}
      {q.selectedItem && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={clsx(s.detailPanel, s.detailPanelSpaced)}
        >
          <div className={s.detailHeader}>
            <button
              className={clsx(s.btn, s.btnGhost, s.btnSm)}
              onClick={() => q.setSelectedItem(null)}
            >
              <ChevronLeft size={16} /> Назад к списку
            </button>
            <div className={s.flexRow}>
              <button
                className={clsx(s.btn, s.btnPrimary, s.btnSm)}
                disabled={q.processingId === q.selectedItem.id}
                onClick={() => { q.approveItem(q.selectedItem!.id); toast('Объявление одобрено'); }}
              >
                <Check size={14} /> Одобрить
              </button>
              <button
                className={clsx(s.btn, s.btnDanger, s.btnSm)}
                disabled={q.processingId === q.selectedItem.id}
                onClick={() => q.openRejectModal(q.selectedItem!)}
              >
                <X size={14} /> Отклонить
              </button>
            </div>
          </div>
          <div className={s.detailBody}>
            <h3 className={s.detailTitle}>
              {q.selectedItem.title}
            </h3>
            <div className={s.detailGrid}>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Категория</span>
                <span className={s.detailValue}>{q.selectedItem.category?.categoryName ?? '—'}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}><MapPin size={12} className={s.inlineIcon} />Город</span>
                <span className={s.detailValue}>{q.selectedItem.city ?? '—'}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}><Banknote size={12} className={s.inlineIcon} />Цена/день</span>
                <span className={s.detailValue}>{formatPrice(q.selectedItem.pricePerDay)}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}><Banknote size={12} className={s.inlineIcon} />Цена/час</span>
                <span className={s.detailValue}>{formatPrice(q.selectedItem.pricePerHour)}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Залог</span>
                <span className={s.detailValue}>{formatPrice(q.selectedItem.depositAmount)}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}><Camera size={12} className={s.inlineIcon} />Фото</span>
                <span className={s.detailValue}>{q.selectedItem.photosCount} шт.</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}><User size={12} className={s.inlineIcon} />Владелец</span>
                <span className={s.detailValue}>{q.selectedItem.ownerName}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}><Clock size={12} className={s.inlineIcon} />Подано</span>
                <span className={s.detailValue}>{formatDate(q.selectedItem.submittedAt)}</span>
              </div>
            </div>
            {q.selectedItem.itemDescription && (
              <div className={s.detailSection}>
                <span className={s.detailLabel}>Описание</span>
                <p className={s.detailText}>
                  {q.selectedItem.itemDescription}
                </p>
              </div>
            )}
            {q.selectedItem.photosCount > 0 && (
              <div className={s.detailSection}>
                <span className={s.detailLabel}>Фотографии ({q.selectedItem.photosCount})</span>
                <div className={s.photoPreviewGrid}>
                  {Array.from({ length: Math.min(q.selectedItem.photosCount, 4) }, (_, i) => (
                    <div key={i} className={s.photoPreviewPlaceholder}>
                      <Image size={20} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Table */}
      {!q.selectedItem && (
        <div className={s.card}>
          <div className={s.tableWrapper}>
            <table className={clsx(s.table, s.tableZebra)}>
              <thead>
                <tr>
                  <SortableHeader label="Объявление" sortKey="title" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Категория" sortKey="category" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Город" sortKey="city" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Цена/день" sortKey="price" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Владелец" sortKey="owner" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <th>Ожидание</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {q.items.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className={s.emptyPanel}>
                        <div className={s.emptyIcon}><ShieldCheck size={28} /></div>
                        <div className={s.emptyTitle}>Очередь пуста</div>
                        <div className={s.emptyText}>Все объявления проверены</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pg.paginatedItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <button
                          className={clsx(s.btn, s.btnGhost, s.btnSm, s.titleBtnLeft)}
                          onClick={() => q.setSelectedItem(item)}
                        >
                          {item.title}
                        </button>
                      </td>
                      <td>{item.category?.categoryName ?? '—'}</td>
                      <td>{item.city ?? '—'}</td>
                      <td>{formatPrice(item.pricePerDay)}</td>
                      <td>{item.ownerName}</td>
                      <td>
                        {(() => {
                          const wt = getWaitingTime(item.submittedAt);
                          return (
                            <span className={clsx(s.waitingBadge, wt.urgent && s.waitingBadgeUrgent)}>
                              <Timer size={12} /> {wt.text}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        <div className={s.flexRowTight}>
                          <button
                            className={clsx(s.btn, s.btnPrimary, s.btnSm)}
                            title="Одобрить"
                            disabled={q.processingId === item.id}
                            onClick={() => { q.approveItem(item.id); toast('Объявление одобрено'); }}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            className={clsx(s.btn, s.btnDanger, s.btnSm)}
                            title="Отклонить"
                            disabled={q.processingId === item.id}
                            onClick={() => q.openRejectModal(item)}
                          >
                            <X size={14} />
                          </button>
                          <button
                            className={clsx(s.btn, s.btnGhost, s.btnSm)}
                            title="Подробнее"
                            onClick={() => q.setSelectedItem(item)}
                          >
                            <Eye size={14} />
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

      {/* Reject modal */}
      <AnimatePresence>
        {q.showRejectModal && (
          <motion.div
            className={s.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => q.setShowRejectModal(false)}
          >
            <motion.div
              className={s.modalPanel}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={s.modalHeader}>
                <h3 className={s.modalTitle}>Отклонение объявления</h3>
                <button className={s.modalClose} onClick={() => q.setShowRejectModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <textarea
                className={s.textarea}
                placeholder="Укажите причину отклонения..."
                value={q.rejectComment}
                onChange={(e) => q.setRejectComment(e.target.value)}
                rows={3}
              />
              <div className={s.modalFooter}>
                <button
                  className={clsx(s.btn, s.btnGhost)}
                  onClick={() => q.setShowRejectModal(false)}
                >
                  Отмена
                </button>
                <button
                  className={clsx(s.btn, s.btnDanger)}
                  disabled={!q.rejectComment.trim()}
                  onClick={() => { q.confirmReject(); toast('Объявление отклонено'); }}
                >
                  <X size={14} /> Отклонить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
