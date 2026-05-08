'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Search,
  Check,
  X,
  Eye,
  Clock,
  Users,
  ShoppingBag,
  Handshake,
  Banknote,
  Settings,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Ban,
  UserCog,
  Archive,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CreditCard,
  RotateCcw,
  Save,
  BarChart3,
  AlertTriangle,
  Download,
  RotateCw,
  Image,
  Activity,
  ArrowUpDown,
  UserPlus,
  FileText,
  Zap,
  Target,
  Percent,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import s from '../../layouts/AdminLayout/AdminLayout.module.scss';
import { useAdminDashboard } from './hooks/useAdminDashboard';
import { useAdminUsers } from './hooks/useAdminUsers';
import { useAdminListings } from './hooks/useAdminListings';
import { useAdminDeals } from './hooks/useAdminDeals';
import { useAdminFinance } from './hooks/useAdminFinance';
import { useAdminSettings } from './hooks/useAdminSettings';
import { useAdminActivityLog } from './hooks/useAdminActivityLog';
import type { AdminTab, AdminUser, ChartPoint, ActivityActionType } from './types';
import type { ItemStatus } from '@/business/ads';
import type { DealStatus } from '@/business/deals';
import type { PaymentStatus } from '@/business/payments';
import type { UserRole } from '@/business/auth';
import { mockAnalyticsData, mockTodayActivity } from './mockAdminData';

/* ── Toast system ──────────────────────────────────────────────────────── */

type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' };
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

type ToastFn = (message: string, type?: Toast['type']) => void;

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(v: number | null | undefined) {
  if (v == null) return '—';
  return v.toLocaleString('ru-RU') + ' ₽';
}

function formatMoney(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' млн ₽';
  if (v >= 1_000) return (v / 1_000).toFixed(0) + ' тыс. ₽';
  return v.toLocaleString('ru-RU') + ' ₽';
}

const ITEM_STATUS_MAP: Record<ItemStatus, { label: string; cls: string }> = {
  DRAFT: { label: 'Черновик', cls: s.badgeGray },
  MODERATION: { label: 'Модерация', cls: s.badgeOrange },
  ACTIVE: { label: 'Активно', cls: s.badgeGreen },
  REJECTED: { label: 'Отклонено', cls: s.badgeRed },
  ARCHIVED: { label: 'Архив', cls: s.badgeGray },
};

const DEAL_STATUS_MAP: Record<DealStatus, { label: string; cls: string }> = {
  PENDING: { label: 'Ожидание', cls: s.badgeOrange },
  CONFIRMED: { label: 'Подтверждена', cls: s.badgeBlue },
  ACTIVE: { label: 'Активна', cls: s.badgeGreen },
  COMPLETED: { label: 'Завершена', cls: s.badgeGreen },
  REJECTED: { label: 'Отклонена', cls: s.badgeRed },
  CANCELLED: { label: 'Отменена', cls: s.badgeGray },
};

const PAYMENT_STATUS_MAP: Record<PaymentStatus, { label: string; cls: string }> = {
  PENDING: { label: 'Ожидание', cls: s.badgeOrange },
  AUTHORIZED: { label: 'Авторизован', cls: s.badgeBlue },
  CAPTURED: { label: 'Списан', cls: s.badgeGreen },
  CANCELED: { label: 'Отменён', cls: s.badgeGray },
  REFUNDED: { label: 'Возврат', cls: s.badgePurple },
};

const ROLE_MAP: Record<UserRole, { label: string; cls: string }> = {
  user: { label: 'Пользователь', cls: s.badgeGray },
  moderator: { label: 'Модератор', cls: s.badgeBlue },
  admin: { label: 'Админ', cls: s.badgePurple },
};

/* ── Skeletons ───────────────────────────────────────────────────────────── */

function StatsSkeleton() {
  return (
    <div className={s.statsGrid}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={s.statCard}>
          <div className={clsx(s.skeleton)} style={{ width: 44, height: 44, borderRadius: 10 }} />
          <div style={{ flex: 1 }}>
            <div className={clsx(s.skeletonLine)} style={{ width: '60%', marginBottom: 6 }} />
            <div className={clsx(s.skeletonLine, s.skeletonSm)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className={s.card}>
      <div className={s.cardBody}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
            <div className={s.skeleton} style={{ width: 40, height: 40, borderRadius: 8 }} />
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

/* ── Simple bar chart ────────────────────────────────────────────────────── */

function MiniBarChart({ data, color = '#22c55e', formatValue }: { data: ChartPoint[]; color?: string; formatValue?: (v: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const fmt = formatValue ?? ((v: number) => v.toLocaleString('ru-RU'));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
      {data.map((d, i) => (
        <div key={i} className={s.chartBar}>
          <div className={s.chartTooltip}>{fmt(d.value)}</div>
          <div
            className={s.chartBarInner}
            style={{
              height: `${(d.value / max) * 100}%`,
              background: color,
            }}
          />
          <span className={s.chartBarLabel}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD TAB
   ═══════════════════════════════════════════════════════════════════════════ */

function DashboardTab() {
  const { data, isLoading, chartTab, setChartTab } = useAdminDashboard();

  if (isLoading || !data) return <StatsSkeleton />;

  const iconColorMap: Record<string, string> = {
    green: s.statIconGreen,
    blue: s.statIconBlue,
    orange: s.statIconOrange,
    red: s.statIconRed,
    purple: s.statIconPurple,
  };

  const StatIcons: Record<string, typeof Users> = {
    users: Users,
    listings: ShoppingBag,
    deals: Handshake,
    revenue: Banknote,
    moderation: Clock,
  };

  const chartData =
    chartTab === 'users'
      ? data.usersChart
      : chartTab === 'deals'
        ? data.dealsChart
        : data.revenueChart;

  const chartColor =
    chartTab === 'users' ? '#22c55e' : chartTab === 'deals' ? '#f59e0b' : '#8b5cf6';

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const analytics = mockAnalyticsData;
  const todayAct = mockTodayActivity;

  const chartFormatValue = chartTab === 'revenue' ? formatMoney : undefined;

  return (
    <>
      {/* Welcome banner */}
      <div className={s.welcomeBanner}>
        <div className={s.welcomeText}>
          <div className={s.welcomeTitle}>Добро пожаловать, Администратор</div>
          <div className={s.welcomeSubtitle}>Обзор платформы «Арендай»</div>
        </div>
        <div className={s.welcomeDate}>{today}</div>
      </div>

      {/* Stats */}
      <div className={s.statsGrid}>
        {data.stats.map((stat) => {
          const Icon = StatIcons[stat.key] ?? BarChart3;
          return (
            <div key={stat.key} className={s.statCard}>
              <div className={clsx(s.statIcon, iconColorMap[stat.color])}>
                <Icon size={22} />
              </div>
              <div className={s.statContent}>
                <div className={s.statValue}>{stat.formatted}</div>
                <div className={s.statLabel}>{stat.label}</div>
                {stat.trend != null && (
                  <div
                    className={clsx(
                      s.statTrend,
                      stat.trend >= 0 ? s.statTrendUp : s.statTrendDown,
                    )}
                  >
                    {stat.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {stat.trend > 0 ? '+' : ''}
                    {stat.trend}% {stat.trendLabel}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics cards */}
      <div className={s.analyticsGrid}>
        <div className={s.analyticsCard}>
          <div className={s.analyticsValue}>{analytics.conversionRate}%</div>
          <div className={s.analyticsLabel}>Конверсия</div>
          <div className={clsx(s.analyticsTrend, analytics.conversionTrend >= 0 ? s.statTrendUp : s.statTrendDown)}>
            {analytics.conversionTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {analytics.conversionTrend > 0 ? '+' : ''}{analytics.conversionTrend}%
          </div>
        </div>
        <div className={s.analyticsCard}>
          <div className={s.analyticsValue}>{formatMoney(analytics.averageCheck)}</div>
          <div className={s.analyticsLabel}>Средний чек</div>
          <div className={clsx(s.analyticsTrend, analytics.averageCheckTrend >= 0 ? s.statTrendUp : s.statTrendDown)}>
            {analytics.averageCheckTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {analytics.averageCheckTrend > 0 ? '+' : ''}{analytics.averageCheckTrend}%
          </div>
        </div>
        <div className={s.analyticsCard}>
          <div className={s.analyticsValue}>{analytics.retentionRate}%</div>
          <div className={s.analyticsLabel}>Удержание</div>
          <div className={clsx(s.analyticsTrend, analytics.retentionTrend >= 0 ? s.statTrendUp : s.statTrendDown)}>
            {analytics.retentionTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {analytics.retentionTrend > 0 ? '+' : ''}{analytics.retentionTrend}%
          </div>
        </div>
        <div className={s.analyticsCard}>
          <div className={s.analyticsValue}>{analytics.viewsToDeals}%</div>
          <div className={s.analyticsLabel}>Просмотры → Сделки</div>
          <div className={clsx(s.analyticsTrend, analytics.viewsToDealsTrend >= 0 ? s.statTrendUp : s.statTrendDown)}>
            {analytics.viewsToDealsTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {analytics.viewsToDealsTrend > 0 ? '+' : ''}{analytics.viewsToDealsTrend}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={s.card} style={{ marginBottom: 24 }}>
        <div className={s.cardHeader}>
          <h3 className={s.cardTitle}>Динамика</h3>
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { key: 'revenue', label: 'Выручка' },
              { key: 'users', label: 'Пользователи' },
              { key: 'deals', label: 'Сделки' },
            ] as const).map((t) => (
              <button
                key={t.key}
                className={clsx(s.btn, chartTab === t.key ? s.btnPrimary : s.btnGhost, s.btnSm)}
                onClick={() => setChartTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className={s.cardBody}>
          <MiniBarChart data={chartData} color={chartColor} formatValue={chartFormatValue} />
        </div>
      </div>

      {/* Today activity */}
      <div className={s.card} style={{ marginBottom: 24 }}>
        <div className={s.cardHeader}>
          <h3 className={s.cardTitle}>Сегодня</h3>
          <Zap size={16} style={{ color: '#f59e0b' }} />
        </div>
        <div className={s.cardBody}>
          <div className={s.todayGrid}>
            <div className={s.todayItem}>
              <div className={s.todayValue}>{todayAct.newRegistrations}</div>
              <div className={s.todayLabel}>Регистраций</div>
            </div>
            <div className={s.todayItem}>
              <div className={s.todayValue}>{todayAct.newListings}</div>
              <div className={s.todayLabel}>Объявлений</div>
            </div>
            <div className={s.todayItem}>
              <div className={s.todayValue}>{todayAct.newDeals}</div>
              <div className={s.todayLabel}>Сделок</div>
            </div>
            <div className={s.todayItem}>
              <div className={s.todayValue}>{todayAct.newComplaints}</div>
              <div className={s.todayLabel}>Жалоб</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className={s.dashboardBottomRow}>
        {/* Recent deals */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <h3 className={s.cardTitle}>Последние сделки</h3>
          </div>
          <div className={s.tableWrapper}>
            <table className={clsx(s.table, s.tableZebra)}>
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Статус</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {data.recentDeals.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 500 }}>{d.itemTitle}</td>
                    <td>
                      <span className={clsx(s.badge, DEAL_STATUS_MAP[d.status].cls)}>
                        {DEAL_STATUS_MAP[d.status].label}
                      </span>
                    </td>
                    <td>{formatPrice(d.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top categories */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <h3 className={s.cardTitle}>Топ категории</h3>
          </div>
          <div className={s.tableWrapper}>
            <table className={clsx(s.table, s.tableZebra)}>
              <thead>
                <tr>
                  <th>Категория</th>
                  <th>Объявлений</th>
                  <th>Выручка</th>
                </tr>
              </thead>
              <tbody>
                {data.topCategories.map((cat) => (
                  <tr key={cat.name}>
                    <td style={{ fontWeight: 500 }}>{cat.name}</td>
                    <td>{cat.count}</td>
                    <td>{formatMoney(cat.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   USERS TAB
   ═══════════════════════════════════════════════════════════════════════════ */

function UsersTab({ toast }: { toast: ToastFn }) {
  const u = useAdminUsers();
  const [roleChangeUser, setRoleChangeUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [banConfirmId, setBanConfirmId] = useState<string | null>(null);

  if (u.isLoading) return <TableSkeleton />;

  return (
    <>
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
          <select
            className={s.filterSelect}
            value={u.filter.role}
            onChange={(e) => u.updateFilter({ role: e.target.value as any })}
          >
            <option value="all">Все роли ({u.countByRole.all})</option>
            <option value="user">Пользователи ({u.countByRole.user})</option>
            <option value="moderator">Модераторы ({u.countByRole.moderator})</option>
            <option value="admin">Админы ({u.countByRole.admin})</option>
          </select>
          <select
            className={s.filterSelect}
            value={u.filter.status}
            onChange={(e) => u.updateFilter({ status: e.target.value as any })}
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="banned">Заблокированные</option>
          </select>
        </div>
      </div>

      {/* Detail panel */}
      {u.selectedUser && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={s.detailPanel}
          style={{ marginBottom: 20 }}
        >
          <div className={s.detailHeader}>
            <button
              className={clsx(s.btn, s.btnGhost, s.btnSm)}
              onClick={() => u.setSelectedUser(null)}
            >
              <ChevronLeft size={16} /> Назад
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className={clsx(s.badge, ROLE_MAP[u.selectedUser.role as UserRole].cls)}>
                {ROLE_MAP[u.selectedUser.role as UserRole].label}
              </span>
              <span className={clsx(s.badge, u.selectedUser.isActive ? s.badgeGreen : s.badgeRed)}>
                {u.selectedUser.isActive ? 'Активен' : 'Заблокирован'}
              </span>
            </div>
          </div>
          <div className={s.detailBody}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
              {u.selectedUser.fullName ?? 'Без имени'}
            </h3>
            <div className={s.detailGrid}>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Email</span>
                <span className={s.detailValue}>{u.selectedUser.email ?? '—'}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Телефон</span>
                <span className={s.detailValue}>{u.selectedUser.phone}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Никнейм</span>
                <span className={s.detailValue}>{u.selectedUser.nickname ?? '—'}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Дата регистрации</span>
                <span className={s.detailValue}>{formatDate(u.selectedUser.createdAt)}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Объявлений</span>
                <span className={s.detailValue}>{u.selectedUser.listingsCount}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Сделок</span>
                <span className={s.detailValue}>{u.selectedUser.dealsCount}</span>
              </div>
            </div>
          </div>
          <div className={s.detailActions}>
            <button
              className={clsx(s.btn, u.selectedUser.isActive ? s.btnDanger : s.btnPrimary)}
              onClick={() => setBanConfirmId(u.selectedUser!.id)}
            >
              {u.selectedUser.isActive ? <><Ban size={14} /> Заблокировать</> : <><Check size={14} /> Разблокировать</>}
            </button>
            <button
              className={clsx(s.btn, s.btnOutline)}
              onClick={() => {
                setRoleChangeUser(u.selectedUser);
                setNewRole(u.selectedUser!.role as UserRole);
              }}
            >
              <UserCog size={14} /> Сменить роль
            </button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      {!u.selectedUser && (
        <div className={s.card}>
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Пользователь</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Роль</th>
                  <th>Статус</th>
                  <th>Объявлений</th>
                  <th>Сделок</th>
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
                  u.items.map((user) => (
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
                        <span className={clsx(s.badge, ROLE_MAP[user.role as UserRole].cls)}>
                          {ROLE_MAP[user.role as UserRole].label}
                        </span>
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
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={s.modalHeader}>
                <h3 className={s.modalTitle}>Смена роли</h3>
                <button className={s.modalClose} onClick={() => setRoleChangeUser(null)}>
                  <X size={18} />
                </button>
              </div>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
                Пользователь: <strong>{roleChangeUser.fullName}</strong>
              </p>
              <select
                className={s.filterSelect}
                style={{ width: '100%' }}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
              >
                <option value="user">Пользователь</option>
                <option value="moderator">Модератор</option>
                <option value="admin">Администратор</option>
              </select>
              <div className={s.modalFooter}>
                <button className={clsx(s.btn, s.btnGhost)} onClick={() => setRoleChangeUser(null)}>
                  Отмена
                </button>
                <button
                  className={clsx(s.btn, s.btnPrimary)}
                  onClick={() => {
                    u.changeRole(roleChangeUser.id, newRole);
                    toast(`Роль пользователя ${roleChangeUser.fullName} изменена на «${ROLE_MAP[newRole].label}»`);
                    setRoleChangeUser(null);
                  }}
                >
                  <Check size={14} /> Сохранить
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
              onClick={() => setBanConfirmId(null)}
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
                  <button className={s.modalClose} onClick={() => setBanConfirmId(null)}>
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
                <div className={s.modalFooter}>
                  <button className={clsx(s.btn, s.btnGhost)} onClick={() => setBanConfirmId(null)}>
                    Отмена
                  </button>
                  <button
                    className={clsx(s.btn, isBanning ? s.btnDanger : s.btnPrimary)}
                    onClick={() => {
                      u.toggleBan(banConfirmId);
                      toast(
                        isBanning
                          ? `Пользователь «${target.fullName}» заблокирован`
                          : `Пользователь «${target.fullName}» разблокирован`,
                      );
                      setBanConfirmId(null);
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

/* ═══════════════════════════════════════════════════════════════════════════
   LISTINGS TAB
   ═══════════════════════════════════════════════════════════════════════════ */

function ListingsTab({ toast }: { toast: ToastFn }) {
  const l = useAdminListings();
  const [archiveConfirmId, setArchiveConfirmId] = useState<string | null>(null);

  if (l.isLoading) return <TableSkeleton />;

  return (
    <>
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
          <select
            className={s.filterSelect}
            value={l.filter.status}
            onChange={(e) => l.updateFilter({ status: e.target.value as any })}
          >
            <option value="all">Все статусы ({l.countByStatus.all})</option>
            <option value="ACTIVE">Активные ({l.countByStatus.ACTIVE ?? 0})</option>
            <option value="MODERATION">На модерации ({l.countByStatus.MODERATION ?? 0})</option>
            <option value="REJECTED">Отклонённые ({l.countByStatus.REJECTED ?? 0})</option>
            <option value="ARCHIVED">Архив ({l.countByStatus.ARCHIVED ?? 0})</option>
            <option value="DRAFT">Черновики ({l.countByStatus.DRAFT ?? 0})</option>
          </select>
          <select
            className={s.filterSelect}
            value={l.filter.category}
            onChange={(e) => l.updateFilter({ category: e.target.value })}
          >
            {l.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Все категории' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Detail */}
      {l.selectedItem && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={s.detailPanel}
          style={{ marginBottom: 20 }}
        >
          <div className={s.detailHeader}>
            <button
              className={clsx(s.btn, s.btnGhost, s.btnSm)}
              onClick={() => l.setSelectedItem(null)}
            >
              <ChevronLeft size={16} /> Назад
            </button>
            <span className={clsx(s.badge, ITEM_STATUS_MAP[l.selectedItem.status].cls)}>
              {ITEM_STATUS_MAP[l.selectedItem.status].label}
            </span>
          </div>
          <div className={s.detailBody}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>{l.selectedItem.title}</h3>
            <div className={s.detailGrid}>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Категория</span>
                <span className={s.detailValue}>{l.selectedItem.category?.categoryName ?? '—'}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Город</span>
                <span className={s.detailValue}>{l.selectedItem.city ?? '—'}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Цена/день</span>
                <span className={s.detailValue}>{formatPrice(l.selectedItem.pricePerDay)}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Залог</span>
                <span className={s.detailValue}>{formatPrice(l.selectedItem.depositAmount)}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Владелец</span>
                <span className={s.detailValue}>{l.selectedItem.ownerName}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Просмотров</span>
                <span className={s.detailValue}>{l.selectedItem.viewsCount}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Сделок</span>
                <span className={s.detailValue}>{l.selectedItem.dealsCount}</span>
              </div>
              <div className={s.detailField}>
                <span className={s.detailLabel}>Выручка</span>
                <span className={s.detailValue}>{formatPrice(l.selectedItem.revenue)}</span>
              </div>
            </div>
            {l.selectedItem.moderationComment && (
              <div style={{ marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>
                <span className={s.detailLabel}>Комментарий модерации</span>
                <p style={{ fontSize: 14, marginTop: 4, color: '#334155' }}>{l.selectedItem.moderationComment}</p>
              </div>
            )}
          </div>
          {l.selectedItem.status === 'ACTIVE' && (
            <div className={s.detailActions}>
              <button
                className={clsx(s.btn, s.btnDanger)}
                onClick={() => setArchiveConfirmId(l.selectedItem!.id)}
              >
                <Archive size={14} /> Принудительно снять
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Table */}
      {!l.selectedItem && (
        <div className={s.card}>
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Объявление</th>
                  <th>Категория</th>
                  <th>Город</th>
                  <th>Цена/день</th>
                  <th>Статус</th>
                  <th>Владелец</th>
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
                  l.items.map((item) => (
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

/* ═══════════════════════════════════════════════════════════════════════════
   DEALS TAB
   ═══════════════════════════════════════════════════════════════════════════ */

function DealsTab({ toast }: { toast: ToastFn }) {
  const d = useAdminDeals();
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
          <select
            className={s.filterSelect}
            value={d.filter.status}
            onChange={(e) => d.updateFilter({ status: e.target.value as any })}
          >
            <option value="all">Все статусы ({d.countByStatus.all})</option>
            <option value="PENDING">Ожидание ({d.countByStatus.PENDING ?? 0})</option>
            <option value="CONFIRMED">Подтверждены ({d.countByStatus.CONFIRMED ?? 0})</option>
            <option value="ACTIVE">Активные ({d.countByStatus.ACTIVE ?? 0})</option>
            <option value="COMPLETED">Завершены ({d.countByStatus.COMPLETED ?? 0})</option>
            <option value="REJECTED">Отклонены ({d.countByStatus.REJECTED ?? 0})</option>
            <option value="CANCELLED">Отменены ({d.countByStatus.CANCELLED ?? 0})</option>
          </select>
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
                <p style={{ fontSize: 14, marginTop: 4, color: '#334155' }}>{d.selectedDeal.rejectionReason}</p>
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
                        {h.comment && <span style={{ color: '#64748b' }}> — {h.comment}</span>}
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
                  <th>Товар</th>
                  <th>Арендатор</th>
                  <th>Владелец</th>
                  <th>Период</th>
                  <th>Сумма</th>
                  <th>Статус</th>
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
                  d.items.map((deal) => (
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

/* ═══════════════════════════════════════════════════════════════════════════
   FINANCE TAB
   ═══════════════════════════════════════════════════════════════════════════ */

function FinanceTab({ toast }: { toast: ToastFn }) {
  const f = useAdminFinance();

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
          <select
            className={s.filterSelect}
            value={f.filter.status}
            onChange={(e) => f.updateFilter({ status: e.target.value as any })}
          >
            <option value="all">Все статусы</option>
            <option value="PENDING">Ожидание</option>
            <option value="AUTHORIZED">Авторизован</option>
            <option value="CAPTURED">Списан</option>
            <option value="CANCELED">Отменён</option>
            <option value="REFUNDED">Возврат</option>
          </select>
        </div>
      </div>

      <div className={s.card}>
        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Товар</th>
                <th>Плательщик</th>
                <th>Получатель</th>
                <th>Аренда</th>
                <th>Залог</th>
                <th>Итого</th>
                <th>Статус</th>
                <th>Дата</th>
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
                f.items.map((p) => (
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
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS TAB
   ═══════════════════════════════════════════════════════════════════════════ */

function SettingsTab({ toast }: { toast: ToastFn }) {
  const st = useAdminSettings();

  if (st.isLoading || !st.settings) return <TableSkeleton rows={3} />;

  return (
    <>
      {/* General settings */}
      <div className={s.card} style={{ marginBottom: 24 }}>
        <div className={s.cardHeader}>
          <h3 className={s.cardTitle}>Основные настройки</h3>
          <button
            className={clsx(s.btn, s.btnPrimary, s.btnSm)}
            onClick={() => { st.saveSettings(); toast('Настройки сохранены'); }}
            disabled={st.isSaving}
          >
            <Save size={14} /> {st.isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
        <div className={s.cardBody}>
          <div className={s.detailGrid}>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Комиссия платформы (%)</span>
              <input
                type="number"
                className={s.filterSelect}
                style={{ width: '100%', marginTop: 4 }}
                value={st.settings.commissionPercent}
                onChange={(e) => st.updateSetting('commissionPercent', Number(e.target.value))}
                min={0}
                max={50}
              />
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Мин. срок аренды (часов)</span>
              <input
                type="number"
                className={s.filterSelect}
                style={{ width: '100%', marginTop: 4 }}
                value={st.settings.minRentalHours}
                onChange={(e) => st.updateSetting('minRentalHours', Number(e.target.value))}
                min={1}
              />
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Макс. залог от стоимости (%)</span>
              <input
                type="number"
                className={s.filterSelect}
                style={{ width: '100%', marginTop: 4 }}
                value={st.settings.maxDepositPercent}
                onChange={(e) => st.updateSetting('maxDepositPercent', Number(e.target.value))}
                min={0}
                max={100}
              />
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Макс. фото на объявление</span>
              <input
                type="number"
                className={s.filterSelect}
                style={{ width: '100%', marginTop: 4 }}
                value={st.settings.maxPhotosPerListing}
                onChange={(e) => st.updateSetting('maxPhotosPerListing', Number(e.target.value))}
                min={1}
                max={20}
              />
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Макс. объявлений на пользователя</span>
              <input
                type="number"
                className={s.filterSelect}
                style={{ width: '100%', marginTop: 4 }}
                value={st.settings.maxListingsPerUser}
                onChange={(e) => st.updateSetting('maxListingsPerUser', Number(e.target.value))}
                min={1}
              />
            </div>
            <div className={s.detailField}>
              <span className={s.detailLabel}>Авто-одобрение объявлений</span>
              <button
                className={clsx(s.btn, s.btnGhost)}
                style={{ marginTop: 4, justifyContent: 'flex-start' }}
                onClick={() => st.updateSetting('autoApproveListings', !st.settings!.autoApproveListings)}
              >
                {st.settings.autoApproveListings ? (
                  <><ToggleRight size={22} color="#22c55e" /> Включено</>
                ) : (
                  <><ToggleLeft size={22} color="#94a3b8" /> Выключено</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className={s.card}>
        <div className={s.cardHeader}>
          <h3 className={s.cardTitle}>Категории</h3>
        </div>
        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Категория</th>
                <th>Slug</th>
                <th>Объявлений</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {st.settings.categories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ fontFamily: 'var(--font-family-mono, monospace)', fontSize: 13 }}>{cat.slug}</td>
                  <td>{cat.itemsCount}</td>
                  <td>
                    <span className={clsx(s.badge, cat.isActive ? s.badgeGreen : s.badgeGray)}>
                      {cat.isActive ? 'Активна' : 'Выкл'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={clsx(s.btn, cat.isActive ? s.btnDanger : s.btnPrimary, s.btnSm)}
                      onClick={() => st.toggleCategory(cat.id)}
                    >
                      {cat.isActive ? 'Выключить' : 'Включить'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACTIVITY LOG TAB
   ═══════════════════════════════════════════════════════════════════════════ */

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

function ActivityLogTab() {
  const al = useAdminActivityLog();

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
          <select
            className={s.filterSelect}
            value={al.filter.action}
            onChange={(e) => al.updateFilter({ action: e.target.value as any })}
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
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
            <span style={{ fontWeight: 400, fontSize: 13, color: '#64748b', marginLeft: 8 }}>
              ({al.items.length} из {al.totalCount})
            </span>
          </h3>
        </div>
        <div className={s.tableWrapper}>
          <table className={clsx(s.table, s.tableZebra)}>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Действие</th>
                <th>Объект</th>
                <th>Автор</th>
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
                al.items.map((entry) => (
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
                    <td style={{ fontSize: 13, color: '#64748b', maxWidth: 200 }}>
                      {entry.details ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT — AdminPanel
   ═══════════════════════════════════════════════════════════════════════════ */

const TABS: { key: AdminTab; label: string; icon: typeof Search }[] = [
  { key: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { key: 'users', label: 'Пользователи', icon: Users },
  { key: 'listings', label: 'Объявления', icon: ShoppingBag },
  { key: 'deals', label: 'Сделки', icon: Handshake },
  { key: 'finance', label: 'Финансы', icon: Banknote },
  { key: 'activity', label: 'Журнал', icon: Activity },
  { key: 'settings', label: 'Настройки', icon: Settings },
];

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const toast = useToast();

  return (
    <div>
      <ToastContainer toasts={toast.toasts} dismiss={toast.dismiss} />

      <div className={s.tabsRow}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={clsx(s.tab, activeTab === tab.key && s.tabActive)}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'users' && <UsersTab toast={toast.show} />}
          {activeTab === 'listings' && <ListingsTab toast={toast.show} />}
          {activeTab === 'deals' && <DealsTab toast={toast.show} />}
          {activeTab === 'finance' && <FinanceTab toast={toast.show} />}
          {activeTab === 'activity' && <ActivityLogTab />}
          {activeTab === 'settings' && <SettingsTab toast={toast.show} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
