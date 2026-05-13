'use client';

import { useState } from 'react';
import { Search, Check, X, Eye, ChevronLeft, Flag } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';
import { usePagination } from '../hooks/usePagination';
import { useSortable } from '../hooks/useSortable';
import { AdminSelect } from '../components/AdminSelect';
import { Pagination } from '../components/AdminPagination';
import { SortableHeader } from '../components/SortableHeader';
import { TableSkeleton } from '../components/Skeletons';
import { formatDate } from '../helpers';
import { useComplaints } from '../../Moderator/hooks/useComplaints';
import { mockComplaintComments } from '../../Moderator/mockModeratorData';
import type { Complaint, ComplaintPriority, ComplaintStatus, ComplaintTarget } from '../../Moderator/types';
import type { ToastFn } from '@/ux/components/Toast';

const COMPLAINT_PRIORITY_MAP: Record<ComplaintPriority, { label: string; cls: string }> = {
  low: { label: 'Низкий', cls: s.badgeGray },
  medium: { label: 'Средний', cls: s.badgeOrange },
  high: { label: 'Высокий', cls: s.badgeRed },
  critical: { label: 'Критический', cls: s.badgePurple },
};

const COMPLAINT_STATUS_MAP: Record<ComplaintStatus, { label: string; cls: string }> = {
  new: { label: 'Открыта', cls: s.badgeBlue },
  in_review: { label: 'В обработке', cls: s.badgeOrange },
  resolved: { label: 'Решена', cls: s.badgeGreen },
  dismissed: { label: 'Отклонена', cls: s.badgeGray },
};

const COMPLAINT_TARGET_MAP: Record<ComplaintTarget, string> = {
  item: 'Объявление',
  user: 'Пользователь',
  review: 'Отзыв',
};

const COMPLAINT_PRIORITY_DOT: Record<ComplaintPriority, string> = {
  low: s.priorityDotLow,
  medium: s.priorityDotMedium,
  high: s.priorityDotHigh,
  critical: s.priorityDotCritical,
};

type ComplaintSortKey = 'target' | 'type' | 'reporter' | 'priority' | 'status' | 'date';
const COMPLAINT_SORT_ACCESSORS: Partial<Record<ComplaintSortKey, (c: Complaint) => string | number | null | undefined>> = {
  target: (c) => c.targetTitle,
  type: (c) => c.target,
  reporter: (c) => c.reporterName,
  priority: (c) => { const order: Record<ComplaintPriority, number> = { low: 0, medium: 1, high: 2, critical: 3 }; return order[c.priority]; },
  status: (c) => c.status,
  date: (c) => c.createdAt,
};

export function ComplaintsTab({ toast }: { toast: ToastFn }) {
  const c = useComplaints();
  const { sortedItems, sortKey, sortDirection, toggleSort } = useSortable<Complaint, ComplaintSortKey>(c.items, COMPLAINT_SORT_ACCESSORS, { key: 'date', direction: 'desc' });
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
              { value: 'new', label: `Открытые (${c.countByStatus.new})` },
              { value: 'in_review', label: `В обработке (${c.countByStatus.in_review})` },
              { value: 'resolved', label: `Решенные (${c.countByStatus.resolved})` },
              { value: 'dismissed', label: `Отклоненные (${c.countByStatus.dismissed})` },
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
              <span className={clsx(s.badge, COMPLAINT_PRIORITY_MAP[c.selectedComplaint.priority].cls)}>
                {COMPLAINT_PRIORITY_MAP[c.selectedComplaint.priority].label}
              </span>
              <span className={clsx(s.badge, COMPLAINT_STATUS_MAP[c.selectedComplaint.status].cls)}>
                {COMPLAINT_STATUS_MAP[c.selectedComplaint.status].label}
              </span>
            </div>
          </div>
          <div className={s.detailBody}>
            <div className={s.detailGrid}>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Тип объекта</span>
                <span className={s.detailValue}>{COMPLAINT_TARGET_MAP[c.selectedComplaint.target]}</span>
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
              <p style={{ fontSize: 14, color: 'var(--color-text)', marginTop: 4, lineHeight: 1.6 }}>
                {c.selectedComplaint.reason}
              </p>
            </div>
            <div style={{ marginTop: 8 }}>
              <span className={s.detailLabel}>Описание</span>
              <p style={{ fontSize: 14, color: 'var(--color-text)', marginTop: 4, lineHeight: 1.6 }}>
                {c.selectedComplaint.description}
              </p>
            </div>
            {c.selectedComplaint.moderatorComment && (
              <div style={{ marginTop: 12 }}>
                <span className={s.detailLabel}>Комментарий модератора</span>
                <p style={{ fontSize: 14, color: 'var(--color-text)', marginTop: 4 }}>
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
                onClick={() => { c.updateStatus(c.selectedComplaint!.id, 'dismissed', 'Жалоба отклонена администратором'); toast('Жалоба отклонена'); }}
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
                      <td>{COMPLAINT_TARGET_MAP[item.target]}</td>
                      <td>{item.reporterName}</td>
                      <td style={{ maxWidth: 200 }} className={s.textTruncate}>{item.reason}</td>
                      <td>
                        <span className={clsx(s.badge, COMPLAINT_PRIORITY_MAP[item.priority].cls)}>
                          <span className={clsx(s.priorityDot, COMPLAINT_PRIORITY_DOT[item.priority])} />
                          {COMPLAINT_PRIORITY_MAP[item.priority].label}
                        </span>
                      </td>
                      <td>
                        <span className={clsx(s.badge, COMPLAINT_STATUS_MAP[item.status].cls)}>
                          {COMPLAINT_STATUS_MAP[item.status].label}
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
                  <Check size={14} /> Решить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
