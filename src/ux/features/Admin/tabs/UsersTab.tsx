'use client';

import { useState } from 'react';
import { Search, Check, X, Eye, Ban, Users, ShieldCheck, Crown, User, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { usePagination } from '../hooks/usePagination';
import { useSortable } from '../hooks/useSortable';
import { AdminSelect } from '../components/AdminSelect';
import { Pagination } from '../components/AdminPagination';
import { SortableHeader } from '../components/SortableHeader';
import { TableSkeleton } from '../components/Skeletons';
import { AdminUserProfile } from '../components/AdminUserProfile';
import { ROLE_MAP, BAN_REASONS } from '../helpers';
import type { AdminUser } from '../types';
import type { ToastFn } from '@/ux/components/Toast';
import type { UserRole } from '@/business/auth';

type UserSortKey = 'name' | 'email' | 'role' | 'listings' | 'deals';
const USER_SORT_ACCESSORS: Partial<Record<UserSortKey, (u: AdminUser) => string | number | null | undefined>> = {
  name: (u) => u.fullName ?? '',
  email: (u) => u.email ?? '',
  role: (u) => u.role,
  listings: (u) => u.listingsCount,
  deals: (u) => u.dealsCount,
};

export function UsersTab({ toast }: { toast: ToastFn }) {
  const u = useAdminUsers();
  const { sortedItems, sortKey, sortDirection, toggleSort } = useSortable<AdminUser, UserSortKey>(u.items, USER_SORT_ACCESSORS);
  const pg = usePagination(sortedItems);
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [banConfirmId, setBanConfirmId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState<string>('');

  if (u.isLoading) return <TableSkeleton />;

  return (
    <>
      {!u.selectedUser && (
        <div className={s.toolbar}>
          <div className={s.toolbarLeft}>
            <div className={s.searchInput}>
              <Search size={16} />
              <input
                placeholder="Поиск по имени, email, телефону..."
                value={u.filter.search}
                onChange={(e) => u.updateFilter({ search: e.target.value })}
              />
            </div>
            <AdminSelect
              value={u.filter.role}
              onChange={(v) => u.updateFilter({ role: v as any })}
              options={[
                { value: 'all', label: `Все роли (${u.countByRole.all})` },
                { value: 'user', label: `Пользователи (${u.countByRole.user})` },
                { value: 'moderator', label: `Модераторы (${u.countByRole.moderator})` },
                { value: 'admin', label: `Админы (${u.countByRole.admin})` },
              ]}
            />
            <AdminSelect
              value={u.filter.status}
              onChange={(v) => u.updateFilter({ status: v as any })}
              options={[
                { value: 'all', label: 'Все статусы' },
                { value: 'active', label: 'Активные' },
                { value: 'banned', label: 'Заблокированные' },
              ]}
            />
          </div>
        </div>
      )}

      {/* Detail panel — PublicProfile-style view with admin controls */}
      {u.selectedUser && (
        <AdminUserProfile
          user={u.selectedUser}
          onBack={() => u.setSelectedUser(null)}
          onBan={(id) => setBanConfirmId(id)}
          onChangeRole={(target) => {
            setRoleChangeUser(target);
            setNewRole(target.role as UserRole);
          }}
        />
      )}

      {/* Table */}
      {!u.selectedUser && (
        <div className={s.card}>
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <SortableHeader label="Пользователь" sortKey="name" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Email" sortKey="email" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <th>Телефон</th>
                  <SortableHeader label="Роль" sortKey="role" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <th>Статус</th>
                  <SortableHeader label="Объявлений" sortKey="listings" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <SortableHeader label="Сделок" sortKey="deals" currentKey={sortKey} direction={sortDirection} onToggle={toggleSort} />
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {u.items.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className={s.emptyPanel}>
                        <div className={s.emptyIcon}><Users size={28} /></div>
                        <div className={s.emptyTitle}>Пользователи не найдены</div>
                        <div className={s.emptyText}>Измените параметры поиска</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pg.paginatedItems.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className={s.tableUserCell}>
                          <div className={s.tableAvatar}>
                            {(user.fullName ?? '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className={s.tableUserName}>{user.fullName ?? '—'}</div>
                            <div className={s.tableUserSub}>@{user.nickname ?? '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{user.email ?? '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{user.phone}</td>
                      <td>
                        <button
                          className={clsx(s.badge, ROLE_MAP[user.role as UserRole].cls, s.badgeClickable)}
                          title="Сменить роль"
                          onClick={() => {
                            setRoleChangeUser(user);
                            setNewRole(user.role as UserRole);
                          }}
                        >
                          {ROLE_MAP[user.role as UserRole].label}
                        </button>
                      </td>
                      <td>
                        <span className={clsx(s.badge, user.isActive ? s.badgeGreen : s.badgeRed)}>
                          {user.isActive ? 'Активен' : 'Бан'}
                        </span>
                      </td>
                      <td>{user.listingsCount}</td>
                      <td>{user.dealsCount}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className={clsx(s.btn, s.btnGhost, s.btnSm)}
                            title="Подробнее"
                            onClick={() => u.setSelectedUser(user)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            className={clsx(s.btn, user.isActive ? s.btnDanger : s.btnPrimary, s.btnSm)}
                            title={user.isActive ? 'Заблокировать' : 'Разблокировать'}
                            onClick={() => setBanConfirmId(user.id)}
                          >
                            {user.isActive ? <Ban size={14} /> : <Check size={14} />}
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

      {/* Role change modal */}
      <AnimatePresence>
        {roleChangeUser && (
          <motion.div
            className={s.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRoleChangeUser(null)}
          >
            <motion.div
              className={s.modalPanel}
              style={{ maxWidth: 520 }}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={s.modalHeader}>
                <h3 className={s.modalTitle}>Управление ролью</h3>
                <button className={s.modalClose} onClick={() => setRoleChangeUser(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className={s.roleModalUser}>
                <div className={s.roleModalAvatar}>
                  {(roleChangeUser.fullName ?? '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className={s.roleModalUserName}>{roleChangeUser.fullName ?? '—'}</div>
                  <div className={s.roleModalUserMeta}>{roleChangeUser.email ?? roleChangeUser.phone}</div>
                </div>
                <span className={clsx(s.badge, ROLE_MAP[roleChangeUser.role as UserRole].cls)} style={{ marginLeft: 'auto' }}>
                  {ROLE_MAP[roleChangeUser.role as UserRole].label}
                </span>
              </div>

              <div className={s.roleCardsGrid}>
                {([
                  {
                    role: 'user' as UserRole,
                    icon: User,
                    title: 'Пользователь',
                    desc: 'Стандартный доступ к платформе',
                    perms: ['Создание объявлений', 'Аренда вещей', 'Оставление отзывов'],
                    color: 'var(--color-text-secondary)',
                    bg: 'rgba(100, 116, 139, 0.08)',
                  },
                  {
                    role: 'moderator' as UserRole,
                    icon: ShieldCheck,
                    title: 'Модератор',
                    desc: 'Модерация контента и жалоб',
                    perms: ['Проверка объявлений', 'Работа с жалобами', 'Модерация отзывов'],
                    color: '#3b82f6',
                    bg: 'rgba(59, 130, 246, 0.08)',
                  },
                  {
                    role: 'admin' as UserRole,
                    icon: Crown,
                    title: 'Администратор',
                    desc: 'Полный доступ к системе',
                    perms: ['Управление пользователями', 'Финансы и настройки', 'Смена ролей'],
                    color: '#8b5cf6',
                    bg: 'rgba(139, 92, 246, 0.08)',
                  },
                ]).map((r) => (
                  <button
                    key={r.role}
                    className={clsx(s.roleCard, newRole === r.role && s.roleCardActive)}
                    style={{ '--role-color': r.color, '--role-bg': r.bg } as React.CSSProperties}
                    onClick={() => setNewRole(r.role)}
                  >
                    <div className={s.roleCardIcon}>
                      <r.icon size={22} />
                    </div>
                    <div className={s.roleCardTitle}>{r.title}</div>
                    <div className={s.roleCardDesc}>{r.desc}</div>
                    <ul className={s.roleCardPerms}>
                      {r.perms.map((p) => (
                        <li key={p}><Check size={12} /> {p}</li>
                      ))}
                    </ul>
                    {newRole === r.role && (
                      <div className={s.roleCardCheck}>
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {newRole === 'admin' && roleChangeUser.role !== 'admin' && (
                <div className={s.roleWarning}>
                  <AlertTriangle size={16} />
                  <span>Администратор получит полный доступ ко всем функциям системы, включая управление другими пользователями.</span>
                </div>
              )}

              <div className={s.modalFooter}>
                <button className={clsx(s.btn, s.btnGhost)} onClick={() => setRoleChangeUser(null)}>
                  Отмена
                </button>
                <button
                  className={clsx(s.btn, s.btnPrimary)}
                  disabled={newRole === roleChangeUser.role}
                  onClick={() => {
                    u.changeRole(roleChangeUser.id, newRole);
                    toast(`Роль пользователя ${roleChangeUser.fullName} изменена на «${ROLE_MAP[newRole].label}»`);
                    setRoleChangeUser(null);
                  }}
                >
                  <Check size={14} /> {newRole === roleChangeUser.role ? 'Роль не изменена' : 'Сохранить роль'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ban confirmation modal */}
      <AnimatePresence>
        {banConfirmId && (() => {
          const target = u.items.find((x) => x.id === banConfirmId) ?? u.selectedUser;
          if (!target) return null;
          const isBanning = target.isActive;
          return (
            <motion.div
              className={s.modalOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setBanConfirmId(null); setBanReason(''); }}
            >
              <motion.div
                className={s.modalPanel}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={s.modalHeader}>
                  <h3 className={s.modalTitle}>{isBanning ? 'Блокировка' : 'Разблокировка'} пользователя</h3>
                  <button className={s.modalClose} onClick={() => { setBanConfirmId(null); setBanReason(''); }}>
                    <X size={18} />
                  </button>
                </div>
                {isBanning && (
                  <div className={s.confirmWarning}>
                    <AlertTriangle size={16} className={s.confirmWarningIcon} />
                    <span>Пользователь потеряет доступ ко всем функциям платформы.</span>
                  </div>
                )}
                <p className={s.confirmBody}>
                  {isBanning
                    ? `Вы уверены, что хотите заблокировать пользователя «${target.fullName}»?`
                    : `Вы уверены, что хотите разблокировать пользователя «${target.fullName}»?`}
                </p>
                {isBanning && (
                  <div className={s.banReasonBlock}>
                    <label className={s.banReasonLabel}>Причина блокировки</label>
                    <select
                      className={s.banReasonSelect}
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                    >
                      <option value="" disabled>Выберите причину…</option>
                      {BAN_REASONS.map((reason) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={s.modalFooter}>
                  <button className={clsx(s.btn, s.btnGhost)} onClick={() => { setBanConfirmId(null); setBanReason(''); }}>
                    Отмена
                  </button>
                  <button
                    className={clsx(s.btn, isBanning ? s.btnDanger : s.btnPrimary)}
                    disabled={isBanning && !banReason}
                    onClick={() => {
                      u.toggleBan(banConfirmId);
                      toast(
                        isBanning
                          ? `Пользователь «${target.fullName}» заблокирован`
                          : `Пользователь «${target.fullName}» разблокирован`,
                      );
                      setBanConfirmId(null);
                      setBanReason('');
                    }}
                  >
                    {isBanning ? <><Ban size={14} /> Заблокировать</> : <><Check size={14} /> Разблокировать</>}
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
