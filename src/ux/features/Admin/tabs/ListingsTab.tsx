'use client';

import { useState } from 'react';
import { Search, X, Eye, ShoppingBag, Archive, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';
import { useAdminListings } from '../hooks/useAdminListings';
import { usePagination } from '../hooks/usePagination';
import { useSortable } from '../hooks/useSortable';
import { AdminSelect } from '../components/AdminSelect';
import { Pagination } from '../components/AdminPagination';
import { SortableHeader } from '../components/SortableHeader';
import { TableSkeleton } from '../components/Skeletons';
import { AdminListingDetail } from '../components/AdminListingDetail';
import { formatPrice, ITEM_STATUS_MAP } from '../helpers';
import type { AdminListing } from '../types';
import type { ToastFn } from '@/ux/components/Toast';

type ListingSortKey = 'title' | 'category' | 'city' | 'price' | 'status' | 'owner';
const LISTING_SORT_ACCESSORS: Partial<Record<ListingSortKey, (i: AdminListing) => string | number | null | undefined>> = {
  title: (i) => i.title,
  category: (i) => i.category?.categoryName ?? '',
  city: (i) => i.city ?? '',
  price: (i) => i.pricePerDay,
  status: (i) => i.status,
  owner: (i) => i.ownerName,
};

export function ListingsTab({ toast }: { toast: ToastFn }) {
  const l = useAdminListings();
  const { sortedItems, sortKey, sortDirection, toggleSort } = useSortable<AdminListing, ListingSortKey>(l.items, LISTING_SORT_ACCESSORS);
  const pg = usePagination(sortedItems);
  const [archiveConfirmId, setArchiveConfirmId] = useState<string | null>(null);

  if (l.isLoading) return <TableSkeleton />;

  return (
    <>
      {!l.selectedItem && (
        <div className={s.toolbar}>
          <div className={s.toolbarLeft}>
            <div className={s.searchInput}>
              <Search size={16} />
              <input
                placeholder="Поиск по названию, городу, владельцу..."
                value={l.filter.search}
                onChange={(e) => l.updateFilter({ search: e.target.value })}
              />
            </div>
            <AdminSelect
              value={l.filter.status}
              onChange={(v) => l.updateFilter({ status: v as any })}
              options={[
                { value: 'all', label: `Все статусы (${l.countByStatus.all})` },
                { value: 'ACTIVE', label: `Активные (${l.countByStatus.ACTIVE ?? 0})` },
                { value: 'MODERATION', label: `На модерации (${l.countByStatus.MODERATION ?? 0})` },
                { value: 'REJECTED', label: `Отклонённые (${l.countByStatus.REJECTED ?? 0})` },
                { value: 'ARCHIVED', label: `Архив (${l.countByStatus.ARCHIVED ?? 0})` },
                { value: 'DRAFT', label: `Черновики (${l.countByStatus.DRAFT ?? 0})` },
              ]}
            />
            <AdminSelect
              value={l.filter.category}
              onChange={(v) => l.updateFilter({ category: v })}
              options={l.categories.map((cat) => ({
                value: cat,
                label: cat === 'all' ? 'Все категории' : cat,
              }))}
            />
          </div>
        </div>
      )}

      {/* Detail — catalog-style view with admin controls */}
      {l.selectedItem && (
        <AdminListingDetail
          listing={l.selectedItem}
          onBack={() => l.setSelectedItem(null)}
          onArchive={(id) => setArchiveConfirmId(id)}
          onApprove={(id) => {
            l.approveListing(id);
            toast('Объявление одобрено и опубликовано');
          }}
          onReject={(id, comment) => {
            l.rejectListing(id, comment);
            toast('Объявление отклонено', 'error');
          }}
          onRestore={(id) => {
            l.restoreFromArchive(id);
            toast('Объявление восстановлено');
          }}
          onSendToModeration={(id) => {
            l.sendToModeration(id);
            toast('Объявление отправлено на модерацию', 'info');
          }}
        />
      )}

      {/* Table */}
      {!l.selectedItem && (
        <div className={s.card}>
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <SortableHeader label="Объявление" sortKey="title" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Категория" sortKey="category" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Город" sortKey="city" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Цена/день" sortKey="price" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Статус" sortKey="status" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Владелец" sortKey="owner" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <th>Просмотры</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {l.items.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className={s.emptyPanel}>
                        <div className={s.emptyIcon}><ShoppingBag size={28} /></div>
                        <div className={s.emptyTitle}>Объявления не найдены</div>
                        <div className={s.emptyText}>Измените параметры поиска</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pg.paginatedItems.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.title}</td>
                      <td>{item.category?.categoryName ?? '—'}</td>
                      <td>{item.city ?? '—'}</td>
                      <td>{formatPrice(item.pricePerDay)}</td>
                      <td>
                        <span className={clsx(s.badge, ITEM_STATUS_MAP[item.status].cls)}>
                          {ITEM_STATUS_MAP[item.status].label}
                        </span>
                      </td>
                      <td>{item.ownerName}</td>
                      <td>{item.viewsCount}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className={clsx(s.btn, s.btnGhost, s.btnSm)}
                            onClick={() => l.setSelectedItem(item)}
                          >
                            <Eye size={14} />
                          </button>
                          {item.status === 'ACTIVE' && (
                            <button
                              className={clsx(s.btn, s.btnDanger, s.btnSm)}
                              title="Снять"
                              onClick={() => setArchiveConfirmId(item.id)}
                            >
                              <Archive size={14} />
                            </button>
                          )}
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

      {/* Archive confirmation modal */}
      <AnimatePresence>
        {archiveConfirmId && (() => {
          const target = l.items.find((x) => x.id === archiveConfirmId);
          return (
            <motion.div
              className={s.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setArchiveConfirmId(null)}
            >
              <motion.div
                className={s.modalPanel}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={s.modalHeader}>
                  <h3 className={s.modalTitle}>Снять объявление</h3>
                  <button className={s.modalClose} onClick={() => setArchiveConfirmId(null)}>
                    <X size={18} />
                  </button>
                </div>
                <div className={s.confirmWarning}>
                  <AlertTriangle size={16} className={s.confirmWarningIcon} />
                  <span>Объявление будет перемещено в архив и скрыто из каталога.</span>
                </div>
                <p className={s.confirmBody}>
                  Вы уверены, что хотите принудительно снять объявление «{target?.title}»?
                </p>
                <div className={s.modalFooter}>
                  <button className={clsx(s.btn, s.btnGhost)} onClick={() => setArchiveConfirmId(null)}>
                    Отмена
                  </button>
                  <button
                    className={clsx(s.btn, s.btnDanger)}
                    onClick={() => {
                      l.forceArchive(archiveConfirmId);
                      toast(`Объявление «${target?.title}» снято`);
                      setArchiveConfirmId(null);
                      l.setSelectedItem(null);
                    }}
                  >
                    <Archive size={14} /> Снять
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}
