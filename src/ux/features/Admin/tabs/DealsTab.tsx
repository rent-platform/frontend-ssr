'use client';

import { useState } from 'react';
import { Search, X, Eye, Handshake, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';
import { useAdminDeals } from '../hooks/useAdminDeals';
import { usePagination } from '../hooks/usePagination';
import { useSortable } from '../hooks/useSortable';
import { AdminSelect } from '../components/AdminSelect';
import { Pagination } from '../components/AdminPagination';
import { SortableHeader } from '../components/SortableHeader';
import { TableSkeleton } from '../components/Skeletons';
import { formatDate, formatDateTime, formatPrice, DEAL_STATUS_MAP } from '../helpers';
import type { AdminDeal } from '../types';
import type { ToastFn } from '../components/Toast';

type DealSortKey = 'item' | 'renter' | 'owner' | 'total' | 'status' | 'start';
const DEAL_SORT_ACCESSORS: Partial<Record<DealSortKey, (d: AdminDeal) => string | number | null | undefined>> = {
  item: (d) => d.itemTitle,
  renter: (d) => d.renterName,
  owner: (d) => d.ownerName,
  total: (d) => d.totalPrice,
  status: (d) => d.status,
  start: (d) => d.startDate,
};

export function DealsTab({ toast }: { toast: ToastFn }) {
  const d = useAdminDeals();
  const { sortedItems, sortKey, sortDirection, toggleSort } = useSortable<AdminDeal, DealSortKey>(d.items, DEAL_SORT_ACCESSORS);
  const pg = usePagination(sortedItems);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  if (d.isLoading) return <TableSkeleton />;

  return (
    <>
      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <div className={s.searchInput}>
            <Search size={16} />
            <input
              placeholder="Поиск по товару, арендатору, владельцу..."
              value={d.filter.search}
              onChange={(e) => d.updateFilter({ search: e.target.value })}
            />
          </div>
          <AdminSelect
            value={d.filter.status}
            onChange={(v) => d.updateFilter({ status: v as any })}
            options={[
              { value: 'all', label: `Все статусы (${d.countByStatus.all})` },
              { value: 'PENDING', label: `Ожидание (${d.countByStatus.PENDING ?? 0})` },
              { value: 'CONFIRMED', label: `Подтверждены (${d.countByStatus.CONFIRMED ?? 0})` },
              { value: 'AWAITING_PAYMENT', label: `Ожидают оплаты (${(d.countByStatus as any).AWAITING_PAYMENT ?? 0})` },
              { value: 'ACTIVE', label: `Активные (${d.countByStatus.ACTIVE ?? 0})` },
              { value: 'COMPLETED', label: `Завершены (${d.countByStatus.COMPLETED ?? 0})` },
              { value: 'REJECTED', label: `Отклонены (${d.countByStatus.REJECTED ?? 0})` },
              { value: 'CANCELLED', label: `Отменены (${d.countByStatus.CANCELLED ?? 0})` },
            ]}
          />
        </div>
      </div>

      {/* Detail */}
      {d.selectedDeal && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={s.detailPanel}
          style={{ marginBottom: 20 }}
        >
          <div className={s.detailHeader}>
            <button
              className={clsx(s.btn, s.btnGhost, s.btnSm)}
              onClick={() => d.setSelectedDeal(null)}
            >
              <ChevronLeft size={16} /> Назад
            </button>
            <span className={clsx(s.badge, DEAL_STATUS_MAP[d.selectedDeal.status].cls)}>
              {DEAL_STATUS_MAP[d.selectedDeal.status].label}
            </span>
          </div>
          <div className={s.detailBody}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>{d.selectedDeal.itemTitle}</h3>
            <div className={s.detailGrid}>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Арендатор</span>
                <span className={s.detailValue}>{d.selectedDeal.renterName}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Владелец</span>
                <span className={s.detailValue}>{d.selectedDeal.ownerName}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Период</span>
                <span className={s.detailValue}>
                  {formatDate(d.selectedDeal.startDate)} — {formatDate(d.selectedDeal.endDate)}
                </span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Сумма</span>
                <span className={s.detailValue}>{formatPrice(d.selectedDeal.totalPrice)}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Залог</span>
                <span className={s.detailValue}>{formatPrice(d.selectedDeal.depositAmount)}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Создана</span>
                <span className={s.detailValue}>{formatDate(d.selectedDeal.createdAt)}</span>
              </div>
            </div>
            {d.selectedDeal.rejectionReason && (
              <div style={{ marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>
                <span className={s.detailLabel}>Причина отмены/отклонения</span>
                <p style={{ fontSize: 14, marginTop: 4, color: 'var(--color-text)' }}>{d.selectedDeal.rejectionReason}</p>
              </div>
            )}
            {/* History timeline */}
            {d.selectedDeal.history && d.selectedDeal.history.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <span className={s.detailLabel} style={{ marginBottom: 12, display: 'block' }}>История изменений</span>
                <div className={s.timeline}>
                  {d.selectedDeal.history.map((h) => (
                    <div key={h.id} className={s.timelineItem}>
                      <div className={s.timelineTime}>{formatDateTime(h.changedAt)}</div>
                      <div className={s.timelineText}>
                        {h.oldStatus ? `${DEAL_STATUS_MAP[h.oldStatus]?.label ?? h.oldStatus} → ` : ''}
                        <strong>{DEAL_STATUS_MAP[h.newStatus]?.label ?? h.newStatus}</strong>
                        {h.comment && <span style={{ color: 'var(--color-text-secondary)' }}> — {h.comment}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {(d.selectedDeal.status === 'PENDING' || d.selectedDeal.status === 'CONFIRMED' || d.selectedDeal.status === 'ACTIVE') && (
            <div className={s.detailActions}>
              <button
                className={clsx(s.btn, s.btnDanger)}
                onClick={() => setCancelId(d.selectedDeal!.id)}
              >
                <X size={14} /> Отменить сделку
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Table */}
      {!d.selectedDeal && (
        <div className={s.card}>
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <SortableHeader label="Товар" sortKey="item" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Арендатор" sortKey="renter" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Владелец" sortKey="owner" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Период" sortKey="start" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Сумма" sortKey="total" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Статус" sortKey="status" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {d.items.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className={s.emptyPanel}>
                        <div className={s.emptyIcon}><Handshake size={28} /></div>
                        <div className={s.emptyTitle}>Сделки не найдены</div>
                        <div className={s.emptyText}>Измените параметры поиска</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pg.paginatedItems.map((deal) => (
                    <tr key={deal.id}>
                      <td style={{ fontWeight: 500 }}>{deal.itemTitle}</td>
                      <td>{deal.renterName}</td>
                      <td>{deal.ownerName}</td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                        {formatDate(deal.startDate)} — {formatDate(deal.endDate)}
                      </td>
                      <td>{formatPrice(deal.totalPrice)}</td>
                      <td>
                        <span className={clsx(s.badge, DEAL_STATUS_MAP[deal.status].cls)}>
                          {DEAL_STATUS_MAP[deal.status].label}
                        </span>
                      </td>
                      <td>
                        <button
                          className={clsx(s.btn, s.btnGhost, s.btnSm)}
                          onClick={() => d.setSelectedDeal(deal)}
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

      {/* Cancel modal */}
      <AnimatePresence>
        {cancelId && (
          <motion.div
            className={s.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCancelId(null)}
          >
            <motion.div
              className={s.modalPanel}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={s.modalHeader}>
                <h3 className={s.modalTitle}>Отмена сделки</h3>
                <button className={s.modalClose} onClick={() => setCancelId(null)}>
                  <X size={18} />
                </button>
              </div>
              <textarea
                className={s.textarea}
                placeholder="Причина отмены..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
              <div className={s.modalFooter}>
                <button className={clsx(s.btn, s.btnGhost)} onClick={() => setCancelId(null)}>
                  Назад
                </button>
                <button
                  className={clsx(s.btn, s.btnDanger)}
                  disabled={!cancelReason.trim()}
                  onClick={() => {
                    d.cancelDeal(cancelId, cancelReason);
                    toast('Сделка отменена');
                    setCancelId(null);
                    setCancelReason('');
                  }}
                >
                  <X size={14} /> Отменить сделку
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
