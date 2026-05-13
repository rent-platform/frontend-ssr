'use client';

import { Search, Banknote, CreditCard, Clock, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';
import { useAdminFinance } from '../hooks/useAdminFinance';
import { usePagination } from '../hooks/usePagination';
import { useSortable } from '../hooks/useSortable';
import { AdminSelect } from '../components/AdminSelect';
import { Pagination } from '../components/AdminPagination';
import { SortableHeader } from '../components/SortableHeader';
import { StatsSkeleton, TableSkeleton } from '../components/Skeletons';
import { formatPrice, formatDate, formatMoney, PAYMENT_STATUS_MAP } from '../helpers';
import type { AdminPayment } from '../types';
import type { ToastFn } from '@/ux/components/Toast';

type FinanceSortKey = 'item' | 'renter' | 'owner' | 'total' | 'status' | 'date';
const FINANCE_SORT_ACCESSORS: Partial<Record<FinanceSortKey, (p: AdminPayment) => string | number | null | undefined>> = {
  item: (p) => p.itemTitle,
  renter: (p) => p.renterName,
  owner: (p) => p.ownerName,
  total: (p) => p.totalAmount,
  status: (p) => p.status,
  date: (p) => p.createdAt,
};

export function FinanceTab({ toast }: { toast: ToastFn }) {
  const f = useAdminFinance();
  const { sortedItems, sortKey, sortDirection, toggleSort } = useSortable<AdminPayment, FinanceSortKey>(f.items, FINANCE_SORT_ACCESSORS);
  const pg = usePagination(sortedItems);

  if (f.isLoading) return <><StatsSkeleton /><TableSkeleton /></>;

  return (
    <>
      {/* Summary stats */}
      {f.summary && (
        <div className={s.statsGrid}>
          <div className={s.statCard}>
            <div className={clsx(s.statIcon, s.statIconGreen)}><Banknote size={22} /></div>
            <div className={s.statContent}>
              <div className={s.statValue}>{formatMoney(f.summary.totalRevenue)}</div>
              <div className={s.statLabel}>Общая выручка</div>
            </div>
          </div>
          <div className={s.statCard}>
            <div className={clsx(s.statIcon, s.statIconBlue)}><CreditCard size={22} /></div>
            <div className={s.statContent}>
              <div className={s.statValue}>{formatMoney(f.summary.totalDeposits)}</div>
              <div className={s.statLabel}>Залоги</div>
            </div>
          </div>
          <div className={s.statCard}>
            <div className={clsx(s.statIcon, s.statIconOrange)}><Clock size={22} /></div>
            <div className={s.statContent}>
              <div className={s.statValue}>{formatMoney(f.summary.pendingPayments)}</div>
              <div className={s.statLabel}>Ожидают оплаты</div>
            </div>
          </div>
          <div className={s.statCard}>
            <div className={clsx(s.statIcon, s.statIconPurple)}><RotateCcw size={22} /></div>
            <div className={s.statContent}>
              <div className={s.statValue}>{formatMoney(f.summary.refundsTotal)}</div>
              <div className={s.statLabel}>Возвраты</div>
            </div>
          </div>
        </div>
      )}

      <div className={s.toolbar}>
        <div className={s.toolbarLeft}>
          <div className={s.searchInput}>
            <Search size={16} />
            <input
              placeholder="Поиск по товару, плательщику..."
              value={f.filter.search}
              onChange={(e) => f.updateFilter({ search: e.target.value })}
            />
          </div>
          <AdminSelect
            value={f.filter.status}
            onChange={(v) => f.updateFilter({ status: v as any })}
            options={[
              { value: 'all', label: 'Все статусы' },
              { value: 'PENDING', label: 'Ожидание' },
              { value: 'AUTHORIZED', label: 'Авторизован' },
              { value: 'CAPTURED', label: 'Списан' },
              { value: 'CANCELED', label: 'Отменён' },
              { value: 'REFUNDED', label: 'Возврат' },
            ]}
          />
        </div>
      </div>

      <div className={s.card}>
        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <SortableHeader label="Товар" sortKey="item" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                <SortableHeader label="Плательщик" sortKey="renter" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                <SortableHeader label="Получатель" sortKey="owner" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                <th>Аренда</th>
                <th>Залог</th>
                <SortableHeader label="Итого" sortKey="total" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                <SortableHeader label="Статус" sortKey="status" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                <SortableHeader label="Дата" sortKey="date" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {f.items.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className={s.emptyPanel}>
                      <div className={s.emptyIcon}><Banknote size={28} /></div>
                      <div className={s.emptyTitle}>Платежей нет</div>
                      <div className={s.emptyText}>Нет платежей по заданным фильтрам</div>
                    </div>
                  </td>
                </tr>
              ) : (
                pg.paginatedItems.map((p) => (
                  <tr key={p.paymentId}>
                    <td style={{ fontWeight: 500 }}>{p.itemTitle}</td>
                    <td>{p.renterName}</td>
                    <td>{p.ownerName}</td>
                    <td>{formatPrice(p.rentalAmount)}</td>
                    <td>{formatPrice(p.depositAmount)}</td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(p.totalAmount)}</td>
                    <td>
                      <span className={clsx(s.badge, PAYMENT_STATUS_MAP[p.status].cls)}>
                        {PAYMENT_STATUS_MAP[p.status].label}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(p.createdAt)}</td>
                    <td>
                      {p.status === 'CAPTURED' && (
                        <button
                          className={clsx(s.btn, s.btnDanger, s.btnSm)}
                          title="Возврат"
                          onClick={() => { f.refundPayment(p.paymentId); toast('Возврат оформлен'); }}
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
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
