'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Check,
  X,
  Flag,
  Star,
  Eye,
  Clock,
  Trash2,
  ShieldCheck,
  MessageSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Camera,
  Banknote,
  User,
  AlertTriangle,
  ArrowUpDown,
  Image,
  Timer,
} from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import s from '../../layouts/AdminLayout/AdminLayout.module.scss';
import { useModerationQueue } from './hooks/useModerationQueue';
import { useComplaints } from './hooks/useComplaints';
import { useReviewsModeration } from './hooks/useReviewsModeration';
import { mockComplaintComments } from './mockModeratorData';
import { usePagination } from '../Admin/hooks/usePagination';
import { useSortable } from '../Admin/hooks/useSortable';
import type {
  ModeratorTab,
  ModerationQueueItem,
  Complaint,
  ModeratedReview,
  ComplaintPriority,
  ComplaintStatus,
  ComplaintTarget,
} from './types';

/* ── Toast system ──────────────────────────────────────────────────────── */

type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' };
type ToastFn = (message: string, type?: Toast['type']) => void;
let toastSeq = 0;

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastSeq;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
}

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div className={s.toastContainer}>
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={clsx(
              s.toast,
              t.type === 'success' && s.toastSuccess,
              t.type === 'error' && s.toastError,
              t.type === 'info' && s.toastInfo,
            )}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
          >
            <div className={s.toastIcon}>
              {t.type === 'success' ? <Check size={14} /> : t.type === 'error' ? <X size={14} /> : <Eye size={14} />}
            </div>
            <span className={s.toastMessage}>{t.message}</span>
            <button className={s.toastClose} onClick={() => dismiss(t.id)}>
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(v: number | null | undefined) {
  if (v == null) return '—';
  return v.toLocaleString('ru-RU') + ' ₽';
}

const PRIORITY_MAP: Record<ComplaintPriority, { label: string; cls: string }> = {
  low: { label: 'Низкий', cls: s.badgeGray },
  medium: { label: 'Средний', cls: s.badgeOrange },
  high: { label: 'Высокий', cls: s.badgeRed },
  critical: { label: 'Критический', cls: s.badgePurple },
};

const STATUS_MAP: Record<ComplaintStatus, { label: string; cls: string }> = {
  new: { label: 'Новая', cls: s.badgeBlue },
  in_review: { label: 'На рассмотрении', cls: s.badgeOrange },
  resolved: { label: 'Решена', cls: s.badgeGreen },
  dismissed: { label: 'Отклонена', cls: s.badgeGray },
};

const TARGET_MAP: Record<ComplaintTarget, string> = {
  item: 'Объявление',
  user: 'Пользователь',
  review: 'Отзыв',
};

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={14}
      fill={i < rating ? '#f59e0b' : 'none'}
      stroke={i < rating ? '#f59e0b' : '#cbd5e1'}
    />
  ));
}

function getWaitingTime(isoDate: string): { text: string; urgent: boolean } {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return { text: `${days}д ${hours % 24}ч`, urgent: days >= 1 };
  if (hours > 0) return { text: `${hours}ч`, urgent: hours >= 4 };
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  return { text: `${mins}мин`, urgent: false };
}

const PRIORITY_DOT_MAP: Record<ComplaintPriority, string> = {
  low: s.priorityDotLow,
  medium: s.priorityDotMedium,
  high: s.priorityDotHigh,
  critical: s.priorityDotCritical,
};

/* ── Skeletons ───────────────────────────────────────────────────────────── */

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className={s.card}>
      <div className={s.cardBody}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
            <div className={s.skeletonLine} style={{ width: 40, height: 40, borderRadius: 8 }} />
            <div style={{ flex: 1 }}>
              <div className={clsx(s.skeletonLine, s.skeletonMd)} style={{ marginBottom: 6 }} />
              <div className={clsx(s.skeletonLine, s.skeletonSm)} />
            </div>
            <div className={s.skeletonLine} style={{ width: 80 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pagination component ───────────────────────────────────────────────── */

function Pagination({ pagination }: { pagination: ReturnType<typeof usePagination> }) {
  const { page, perPage, perPageOptions, totalItems, totalPages, startIndex, endIndex, setPage, setPerPage, goNext, goPrev, getPageNumbers } = pagination;
  if (totalItems === 0) return null;
  return (
    <div className={s.paginationWrapper}>
      <div className={s.paginationInfo}>
        {startIndex + 1}–{endIndex} из {totalItems}
      </div>
      <div className={s.pagination}>
        <button className={s.pageBtn} disabled={page <= 1} onClick={goPrev}>
          <ChevronLeft size={14} />
        </button>
        {getPageNumbers().map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e${i}`} className={s.pageBtn} style={{ border: 'none', cursor: 'default', opacity: 0.5 }}>…</span>
          ) : (
            <button key={p} className={clsx(s.pageBtn, p === page && s.pageBtnActive)} onClick={() => setPage(p)}>
              {p}
            </button>
          ),
        )}
        <button className={s.pageBtn} disabled={page >= totalPages} onClick={goNext}>
          <ChevronRight size={14} />
        </button>
      </div>
      <div className={s.paginationPerPage}>
        <span>Строк:</span>
        <AdminSelect
          value={String(perPage)}
          onChange={(v) => setPerPage(Number(v))}
          options={perPageOptions.map((o) => ({ value: String(o), label: String(o) }))}
        />
      </div>
    </div>
  );
}

/* ── Sortable header ────────────────────────────────────────────────────── */

function SortableHeader<K extends string>({
  label,
  sortKey,
  currentKey,
  direction,
  onToggle,
}: {
  label: string;
  sortKey: K;
  currentKey: K | null;
  direction: 'asc' | 'desc';
  onToggle: (key: K) => void;
}) {
  const isActive = currentKey === sortKey;
  return (
    <th>
      <button className={s.sortableHeader} onClick={() => onToggle(sortKey)}>
        {label}
        <ArrowUpDown
          size={12}
          className={clsx(s.sortIcon, isActive && s.sortIconActive, isActive && direction === 'desc' && s.sortIconDesc)}
        />
      </button>
    </th>
  );
}

/* ── Custom select ──────────────────────────────────────────────────────── */

type SelectOption = { value: string; label: string };

function AdminSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={s.adminSelect}>
      <button
        type="button"
        className={clsx(s.adminSelectTrigger, open && s.adminSelectTriggerOpen)}
        onClick={() => setOpen((p) => !p)}
      >
        {selected?.label ?? '—'}
      </button>
      <ChevronDown size={14} className={clsx(s.adminSelectChevron, open && s.adminSelectChevronOpen)} />
      {open && (
        <div className={s.adminSelectDropdown}>
          <div className={s.adminSelectOptions}>
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={opt.value === value ? s.adminSelectOptionActive : s.adminSelectOption}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODERATION QUEUE TAB
   ═══════════════════════════════════════════════════════════════════════════ */

type QueueSortKey = 'title' | 'category' | 'city' | 'price' | 'owner';
const QUEUE_SORT_ACCESSORS: Partial<Record<QueueSortKey, (i: ModerationQueueItem) => string | number | null | undefined>> = {
  title: (i) => i.title,
  category: (i) => i.category?.categoryName ?? '',
  city: (i) => i.city ?? '',
  price: (i) => i.pricePerDay,
  owner: (i) => i.ownerName,
};

function ModerationQueueTab({ toast }: { toast: ToastFn }) {
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
          <span style={{ fontSize: 13, color: '#64748b' }}>
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
          className={s.detailPanel}
          style={{ marginBottom: 20 }}
        >
          <div className={s.detailHeader}>
            <button
              className={clsx(s.btn, s.btnGhost, s.btnSm)}
              onClick={() => q.setSelectedItem(null)}
            >
              <ChevronLeft size={16} /> Назад к списку
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
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
            <h3 style={{ fontFamily: 'var(--font-family-display)', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
              {q.selectedItem.title}
            </h3>
            <div className={s.detailGrid}>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Категория</span>
                <span className={s.detailValue}>{q.selectedItem.category?.categoryName ?? '—'}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Город</span>
                <span className={s.detailValue}>{q.selectedItem.city ?? '—'}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}><Banknote size={12} style={{ display: 'inline', marginRight: 4 }} />Цена/день</span>
                <span className={s.detailValue}>{formatPrice(q.selectedItem.pricePerDay)}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}><Banknote size={12} style={{ display: 'inline', marginRight: 4 }} />Цена/час</span>
                <span className={s.detailValue}>{formatPrice(q.selectedItem.pricePerHour)}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Залог</span>
                <span className={s.detailValue}>{formatPrice(q.selectedItem.depositAmount)}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}><Camera size={12} style={{ display: 'inline', marginRight: 4 }} />Фото</span>
                <span className={s.detailValue}>{q.selectedItem.photosCount} шт.</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}><User size={12} style={{ display: 'inline', marginRight: 4 }} />Владелец</span>
                <span className={s.detailValue}>{q.selectedItem.ownerName}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />Подано</span>
                <span className={s.detailValue}>{formatDate(q.selectedItem.submittedAt)}</span>
              </div>
            </div>
            {q.selectedItem.itemDescription && (
              <div style={{ marginTop: 16 }}>
                <span className={s.detailLabel}>Описание</span>
                <p style={{ fontSize: 14, color: '#334155', marginTop: 4, lineHeight: 1.6 }}>
                  {q.selectedItem.itemDescription}
                </p>
              </div>
            )}
            {q.selectedItem.photosCount > 0 && (
              <div style={{ marginTop: 16 }}>
                <span className={s.detailLabel}>Фотографии ({q.selectedItem.photosCount})</span>
                <div className={s.photoPreviewGrid} style={{ marginTop: 8 }}>
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
                          className={clsx(s.btn, s.btnGhost, s.btnSm)}
                          style={{ textAlign: 'left', fontWeight: 500 }}
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
                        <div style={{ display: 'flex', gap: 6 }}>
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

/* ═══════════════════════════════════════════════════════════════════════════
   COMPLAINTS TAB
   ═══════════════════════════════════════════════════════════════════════════ */

type ComplaintSortKey = 'target' | 'type' | 'reporter' | 'priority' | 'status' | 'date';
const COMPLAINT_SORT_ACCESSORS: Partial<Record<ComplaintSortKey, (c: Complaint) => string | number | null | undefined>> = {
  target: (c) => c.targetTitle,
  type: (c) => c.target,
  reporter: (c) => c.reporterName,
  priority: (c) => { const m: Record<ComplaintPriority, number> = { low: 0, medium: 1, high: 2, critical: 3 }; return m[c.priority]; },
  status: (c) => c.status,
  date: (c) => c.createdAt,
};

function ComplaintsTab({ toast }: { toast: ToastFn }) {
  const c = useComplaints();
  const { sortedItems, sortKey, sortDirection, toggleSort } = useSortable<Complaint, ComplaintSortKey>(c.items, COMPLAINT_SORT_ACCESSORS);
  const pg = usePagination(sortedItems);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolveComment, setResolveComment] = useState('');

  if (c.isLoading) return <TableSkeleton />;

  return (
    <>
      {/* Complaint stats */}
      <div className={s.complaintStats}>
        <div className={s.complaintStatItem}>
          <div className={s.complaintStatValue}>{c.countByStatus.new}</div>
          <div className={s.complaintStatLabel}>Новых</div>
        </div>
        <div className={s.complaintStatItem}>
          <div className={s.complaintStatValue}>{c.countByStatus.in_review}</div>
          <div className={s.complaintStatLabel}>В работе</div>
        </div>
        <div className={s.complaintStatItem}>
          <div className={s.complaintStatValue}>{c.countByStatus.resolved}</div>
          <div className={s.complaintStatLabel}>Решённых</div>
        </div>
        <div className={s.complaintStatItem}>
          <div className={s.complaintStatValue}>{c.countByStatus.dismissed}</div>
          <div className={s.complaintStatLabel}>Отклонённых</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <div className={s.searchInput}>
            <Search size={16} />
            <input
              placeholder="Поиск по теме, заявителю..."
              value={c.filter.search}
              onChange={(e) => c.updateFilter({ search: e.target.value })}
            />
          </div>
          <AdminSelect
            value={c.filter.status}
            onChange={(v) => c.updateFilter({ status: v as any })}
            options={[
              { value: 'all', label: `Все статусы (${c.countByStatus.all})` },
              { value: 'new', label: `Новые (${c.countByStatus.new})` },
              { value: 'in_review', label: `На рассмотрении (${c.countByStatus.in_review})` },
              { value: 'resolved', label: `Решённые (${c.countByStatus.resolved})` },
              { value: 'dismissed', label: `Отклонённые (${c.countByStatus.dismissed})` },
            ]}
          />
          <AdminSelect
            value={c.filter.priority}
            onChange={(v) => c.updateFilter({ priority: v as any })}
            options={[
              { value: 'all', label: 'Любой приоритет' },
              { value: 'low', label: 'Низкий' },
              { value: 'medium', label: 'Средний' },
              { value: 'high', label: 'Высокий' },
              { value: 'critical', label: 'Критический' },
            ]}
          />
          <AdminSelect
            value={c.filter.target}
            onChange={(v) => c.updateFilter({ target: v as any })}
            options={[
              { value: 'all', label: 'Все типы' },
              { value: 'item', label: 'Объявления' },
              { value: 'user', label: 'Пользователи' },
              { value: 'review', label: 'Отзывы' },
            ]}
          />
        </div>
      </div>

      {/* Detail view */}
      {c.selectedComplaint && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={s.detailPanel}
          style={{ marginBottom: 20 }}
        >
          <div className={s.detailHeader}>
            <button
              className={clsx(s.btn, s.btnGhost, s.btnSm)}
              onClick={() => c.setSelectedComplaint(null)}
            >
              <ChevronLeft size={16} /> Назад
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className={clsx(s.badge, PRIORITY_MAP[c.selectedComplaint.priority].cls)}>
                {PRIORITY_MAP[c.selectedComplaint.priority].label}
              </span>
              <span className={clsx(s.badge, STATUS_MAP[c.selectedComplaint.status].cls)}>
                {STATUS_MAP[c.selectedComplaint.status].label}
              </span>
            </div>
          </div>
          <div className={s.detailBody}>
            <div className={s.detailGrid}>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Тип объекта</span>
                <span className={s.detailValue}>{TARGET_MAP[c.selectedComplaint.target]}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Объект</span>
                <span className={s.detailValue}>{c.selectedComplaint.targetTitle}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Заявитель</span>
                <span className={s.detailValue}>{c.selectedComplaint.reporterName}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Дата</span>
                <span className={s.detailValue}>{formatDate(c.selectedComplaint.createdAt)}</span>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <span className={s.detailLabel}>Причина жалобы</span>
              <p style={{ fontSize: 14, color: '#334155', marginTop: 4, lineHeight: 1.6 }}>
                {c.selectedComplaint.reason}
              </p>
            </div>
            {c.selectedComplaint.moderatorComment && (
              <div style={{ marginTop: 12 }}>
                <span className={s.detailLabel}>Комментарий модератора</span>
                <p style={{ fontSize: 14, color: '#334155', marginTop: 4 }}>
                  {c.selectedComplaint.moderatorComment}
                </p>
              </div>
            )}
            {/* Complaint timeline */}
            {(() => {
              const comments = mockComplaintComments[c.selectedComplaint!.id] ?? [];
              if (comments.length === 0) return null;
              return (
                <div style={{ marginTop: 20 }}>
                  <span className={s.detailLabel} style={{ marginBottom: 12, display: 'block' }}>Хронология</span>
                  <div className={s.complaintTimeline}>
                    {comments.map((comment) => (
                      <div key={comment.id} className={s.complaintTimelineItem}>
                        <div className={s.complaintTimelineDot} />
                        <div className={s.complaintTimelineContent}>
                          <div className={s.complaintTimelineAuthor}>{comment.author}</div>
                          <div className={s.complaintTimelineText}>{comment.text}</div>
                          <div className={s.complaintTimelineDate}>{formatDate(comment.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
          {(c.selectedComplaint.status === 'new' || c.selectedComplaint.status === 'in_review') && (
            <div className={s.detailActions}>
              {c.selectedComplaint.status === 'new' && (
                <button
                  className={clsx(s.btn, s.btnOutline)}
                  onClick={() => { c.updateStatus(c.selectedComplaint!.id, 'in_review'); toast('Жалоба взята в работу'); }}
                >
                  <Eye size={14} /> Взять в работу
                </button>
              )}
              <button
                className={clsx(s.btn, s.btnPrimary)}
                onClick={() => setResolveId(c.selectedComplaint!.id)}
              >
                <Check size={14} /> Решить
              </button>
              <button
                className={clsx(s.btn, s.btnDanger)}
                onClick={() => { c.updateStatus(c.selectedComplaint!.id, 'dismissed', 'Жалоба отклонена'); toast('Жалоба отклонена'); }}
              >
                <X size={14} /> Отклонить
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Table */}
      {!c.selectedComplaint && (
        <div className={s.card}>
          <div className={s.tableWrapper}>
            <table className={clsx(s.table, s.tableZebra)}>
              <thead>
                <tr>
                  <SortableHeader label="Объект" sortKey="target" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Тип" sortKey="type" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Заявитель" sortKey="reporter" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <th>Причина</th>
                  <SortableHeader label="Приоритет" sortKey="priority" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Статус" sortKey="status" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Дата" sortKey="date" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {c.items.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className={s.emptyPanel}>
                        <div className={s.emptyIcon}><Flag size={28} /></div>
                        <div className={s.emptyTitle}>Жалоб нет</div>
                        <div className={s.emptyText}>Нет жалоб по заданным фильтрам</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pg.paginatedItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500, maxWidth: 160 }} className={s.textTruncate}>{item.targetTitle}</td>
                      <td>{TARGET_MAP[item.target]}</td>
                      <td>{item.reporterName}</td>
                      <td style={{ maxWidth: 200 }} className={s.textTruncate}>{item.reason}</td>
                      <td>
                        <span className={clsx(s.badge, PRIORITY_MAP[item.priority].cls)}>
                          <span className={clsx(s.priorityDot, PRIORITY_DOT_MAP[item.priority])} />
                          {PRIORITY_MAP[item.priority].label}
                        </span>
                      </td>
                      <td>
                        <span className={clsx(s.badge, STATUS_MAP[item.status].cls)}>
                          {STATUS_MAP[item.status].label}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(item.createdAt)}</td>
                      <td>
                        <button
                          className={clsx(s.btn, s.btnGhost, s.btnSm)}
                          onClick={() => c.setSelectedComplaint(item)}
                        >
                          <Eye size={14} />
                        </button>
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

      {/* Resolve modal */}
      <AnimatePresence>
        {resolveId && (
          <motion.div
            className={s.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setResolveId(null)}
          >
            <motion.div
              className={s.modalPanel}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={s.modalHeader}>
                <h3 className={s.modalTitle}>Решение жалобы</h3>
                <button className={s.modalClose} onClick={() => setResolveId(null)}>
                  <X size={18} />
                </button>
              </div>
              <textarea
                className={s.textarea}
                placeholder="Опишите принятое решение..."
                value={resolveComment}
                onChange={(e) => setResolveComment(e.target.value)}
                rows={3}
              />
              <div className={s.modalFooter}>
                <button className={clsx(s.btn, s.btnGhost)} onClick={() => setResolveId(null)}>
                  Отмена
                </button>
                <button
                  className={clsx(s.btn, s.btnPrimary)}
                  disabled={!resolveComment.trim()}
                  onClick={() => {
                    c.updateStatus(resolveId, 'resolved', resolveComment);
                    toast('Жалоба решена');
                    setResolveId(null);
                    setResolveComment('');
                  }}
                >
                  <Check size={14} /> Подтвердить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REVIEWS MODERATION TAB
   ═══════════════════════════════════════════════════════════════════════════ */

type ReviewSortKey = 'reviewer' | 'item' | 'rating' | 'flagged' | 'date';
const REVIEW_SORT_ACCESSORS: Partial<Record<ReviewSortKey, (r: ModeratedReview) => string | number | boolean | null | undefined>> = {
  reviewer: (r) => r.reviewerName,
  item: (r) => r.itemTitle,
  rating: (r) => r.rating,
  flagged: (r) => r.isFlagged,
  date: (r) => r.createdAt,
};

function ReviewsModerationTab({ toast }: { toast: ToastFn }) {
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
          <span style={{ fontSize: 13, color: '#64748b' }}>
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
          className={s.detailPanel}
          style={{ marginBottom: 20 }}
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
                <span className={s.detailValue} style={{ display: 'flex', gap: 2 }}>
                  {renderStars(r.selectedReview.rating)}
                </span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Дата</span>
                <span className={s.detailValue}>{formatDate(r.selectedReview.createdAt)}</span>
              </div>
            </div>
            {r.selectedReview.text && (
              <div style={{ marginTop: 16 }}>
                <span className={s.detailLabel}>Текст отзыва</span>
                <p style={{ fontSize: 14, color: '#334155', marginTop: 4, lineHeight: 1.6 }}>
                  {r.selectedReview.text}
                </p>
              </div>
            )}
            {r.selectedReview.flagReason && (
              <div style={{ marginTop: 12, padding: 12, background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>
                <span className={s.detailLabel}>Причина флага</span>
                <p style={{ fontSize: 14, marginTop: 4, color: '#334155' }}>{r.selectedReview.flagReason}</p>
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
                      <td style={{ fontWeight: 500 }}>{rev.reviewerName}</td>
                      <td style={{ maxWidth: 160 }} className={s.textTruncate}>{rev.itemTitle}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 2 }}>{renderStars(rev.rating)}</div>
                      </td>
                      <td style={{ maxWidth: 200 }} className={s.textTruncate}>{rev.text ?? '—'}</td>
                      <td>
                        {rev.isFlagged ? (
                          <span className={clsx(s.badge, s.badgeRed)}><Flag size={10} /> Да</span>
                        ) : (
                          <span className={clsx(s.badge, s.badgeGreen)}>Нет</span>
                        )}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(rev.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
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

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════════════ */

export function ModeratorPanel({ activeTab = 'queue' as ModeratorTab }: { activeTab?: ModeratorTab }) {
  const toast = useToast();

  return (
    <div>
      <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'queue' && <ModerationQueueTab toast={toast.show} />}
          {activeTab === 'complaints' && <ComplaintsTab toast={toast.show} />}
          {activeTab === 'reviews' && <ReviewsModerationTab toast={toast.show} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
