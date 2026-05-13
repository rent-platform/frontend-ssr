'use client';

import { Search, Activity, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';
import { useAdminActivityLog } from '../hooks/useAdminActivityLog';
import { usePagination } from '../hooks/usePagination';
import { useSortable } from '../hooks/useSortable';
import { AdminSelect } from '../components/AdminSelect';
import { Pagination } from '../components/AdminPagination';
import { SortableHeader } from '../components/SortableHeader';
import { TableSkeleton } from '../components/Skeletons';
import { formatDateTime } from '../helpers';
import type { ActivityLogEntry, ActivityActionType } from '../types';

const ACTION_BADGE_MAP: Record<string, string> = {
  user_ban: s.actionBan,
  user_unban: s.actionUnban,
  user_role_change: s.actionRole,
  listing_archive: s.actionArchive,
  listing_approve: s.actionApprove,
  listing_reject: s.actionReject,
  deal_cancel: s.actionCancel,
  payment_refund: s.actionRefund,
  settings_change: s.actionSettings,
  complaint_resolve: s.actionApprove,
  review_delete: s.actionReject,
};

const ACTION_OPTIONS: { value: ActivityActionType | 'all'; label: string }[] = [
  { value: 'all', label: 'Все действия' },
  { value: 'user_ban', label: 'Блокировка' },
  { value: 'user_unban', label: 'Разблокировка' },
  { value: 'user_role_change', label: 'Смена роли' },
  { value: 'listing_archive', label: 'Снятие объявления' },
  { value: 'listing_approve', label: 'Одобрение' },
  { value: 'listing_reject', label: 'Отклонение' },
  { value: 'deal_cancel', label: 'Отмена сделки' },
  { value: 'payment_refund', label: 'Возврат платежа' },
  { value: 'settings_change', label: 'Настройки' },
  { value: 'complaint_resolve', label: 'Решение жалобы' },
  { value: 'review_delete', label: 'Удаление отзыва' },
];

type ActivitySortKey = 'date' | 'action' | 'target' | 'author';
const ACTIVITY_SORT_ACCESSORS: Partial<Record<ActivitySortKey, (e: ActivityLogEntry) => string | number | null | undefined>> = {
  date: (e) => e.performedAt,
  action: (e) => e.actionLabel,
  target: (e) => e.targetTitle,
  author: (e) => e.performedByName,
};

export function ActivityLogTab() {
  const al = useAdminActivityLog();
  const { sortedItems, sortKey, sortDirection, toggleSort } = useSortable<ActivityLogEntry, ActivitySortKey>(al.items, ACTIVITY_SORT_ACCESSORS, { key: 'date', direction: 'desc' });
  const pg = usePagination(sortedItems);

  if (al.isLoading) return <TableSkeleton rows={6} />;

  return (
    <>
      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <div className={s.searchInput}>
            <Search size={16} />
            <input
              placeholder="Поиск по действию, объекту, автору..."
              value={al.filter.search}
              onChange={(e) => al.updateFilter({ search: e.target.value })}
            />
          </div>
          <AdminSelect
            value={al.filter.action}
            onChange={(v) => al.updateFilter({ action: v as any })}
            options={ACTION_OPTIONS}
          />
          <input
            type="date"
            className={s.dateInput}
            value={al.filter.dateFrom}
            onChange={(e) => al.updateFilter({ dateFrom: e.target.value })}
            title="Дата от"
          />
          <input
            type="date"
            className={s.dateInput}
            value={al.filter.dateTo}
            onChange={(e) => al.updateFilter({ dateTo: e.target.value })}
            title="Дата до"
          />
          {(al.filter.search || al.filter.action !== 'all' || al.filter.dateFrom || al.filter.dateTo) && (
            <button className={s.resetBtn} onClick={al.resetFilter}>
              <RefreshCw size={12} /> Сбросить
            </button>
          )}
        </div>
      </div>

      <div className={s.card}>
        <div className={s.cardHeader}>
          <h3 className={s.cardTitle}>
            Журнал действий
            <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--color-text-secondary)', marginLeft: 8 }}>
              ({al.items.length} из {al.totalCount})
            </span>
          </h3>
        </div>
        <div className={s.tableWrapper}>
          <table className={clsx(s.table, s.tableZebra)}>
            <thead>
              <tr>
                <SortableHeader label="Дата" sortKey="date" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                <SortableHeader label="Действие" sortKey="action" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                <SortableHeader label="Объект" sortKey="target" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                <SortableHeader label="Автор" sortKey="author" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                <th>Детали</th>
              </tr>
            </thead>
            <tbody>
              {al.items.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={s.emptyPanel}>
                      <div className={s.emptyIcon}><Activity size={28} /></div>
                      <div className={s.emptyTitle}>Действий не найдено</div>
                      <div className={s.emptyText}>Измените параметры фильтрации</div>
                    </div>
                  </td>
                </tr>
              ) : (
                pg.paginatedItems.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 13 }}>
                      {formatDateTime(entry.performedAt)}
                    </td>
                    <td>
                      <span className={clsx(s.actionBadge, ACTION_BADGE_MAP[entry.action])}>
                        {entry.actionLabel}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{entry.targetTitle}</td>
                    <td>{entry.performedByName}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)', maxWidth: 200 }}>
                      {entry.details ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pg} />
      </div>
    </>
  );
}
