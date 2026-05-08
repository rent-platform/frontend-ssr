'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
  Flag,
  MessageSquare,
  Shield,
  ShieldCheck,
  Crown,
  User,
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
import { usePagination } from './hooks/usePagination';
import { useSortable } from './hooks/useSortable';
import type { AdminTab, AdminUser, AdminListing, AdminDeal, AdminPayment, ActivityLogEntry, ChartPoint, ActivityActionType } from './types';
import { useComplaints } from '../Moderator/hooks/useComplaints';
import { mockComplaintComments } from '../Moderator/mockModeratorData';
import type { Complaint, ComplaintPriority, ComplaintStatus, ComplaintTarget } from '../Moderator/types';
import type { ItemStatus } from '@/business/ads';
import type { DealStatus } from '@/business/deals';
import type { PaymentStatus } from '@/business/payments';
import type { UserRole } from '@/business/auth';
import { mockAnalyticsData, mockTodayActivity } from './mockAdminData';
import { AdminUserProfile } from './components/AdminUserProfile';

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

const BAN_REASONS = [
  'Нарушение правил платформы',
  'Мошенничество',
  'Спам или реклама',
  'Оскорбительное поведение',
  'Фейковые объявления',
  'Подозрительная активность',
  'Нарушение условий сделки',
  'Множественные жалобы',
] as const;

type UserSortKey = 'name' | 'email' | 'role' | 'listings' | 'deals';
const USER_SORT_ACCESSORS: Partial<Record<UserSortKey, (u: AdminUser) => string | number | null | undefined>> = {
  name: (u) => u.fullName ?? '',
  email: (u) => u.email ?? '',
  role: (u) => u.role,
  listings: (u) => u.listingsCount,
  deals: (u) => u.dealsCount,
};

function UsersTab({ toast }: { toast: ToastFn }) {
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
                    color: '#64748b',
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

/* ═══════════════════════════════════════════════════════════════════════════
   LISTINGS TAB
   ═══════════════════════════════════════════════════════════════════════════ */

type ListingSortKey = 'title' | 'category' | 'city' | 'price' | 'status' | 'owner';
const LISTING_SORT_ACCESSORS: Partial<Record<ListingSortKey, (i: AdminListing) => string | number | null | undefined>> = {
  title: (i) => i.title,
  category: (i) => i.category?.categoryName ?? '',
  city: (i) => i.city ?? '',
  price: (i) => i.pricePerDay,
  status: (i) => i.status,
  owner: (i) => i.ownerName,
};

function ListingsTab({ toast }: { toast: ToastFn }) {
  const l = useAdminListings();
  const { sortedItems, sortKey, sortDirection, toggleSort } = useSortable<AdminListing, ListingSortKey>(l.items, LISTING_SORT_ACCESSORS);
  const pg = usePagination(sortedItems);
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

/* ═══════════════════════════════════════════════════════════════════════════
   DEALS TAB
   ═══════════════════════════════════════════════════════════════════════════ */

type DealSortKey = 'item' | 'renter' | 'owner' | 'total' | 'status' | 'start';
const DEAL_SORT_ACCESSORS: Partial<Record<DealSortKey, (d: AdminDeal) => string | number | null | undefined>> = {
  item: (d) => d.itemTitle,
  renter: (d) => d.renterName,
  owner: (d) => d.ownerName,
  total: (d) => d.totalPrice,
  status: (d) => d.status,
  start: (d) => d.startDate,
};

function DealsTab({ toast }: { toast: ToastFn }) {
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

/* ═══════════════════════════════════════════════════════════════════════════
   FINANCE TAB
   ═══════════════════════════════════════════════════════════════════════════ */

type FinanceSortKey = 'item' | 'renter' | 'owner' | 'total' | 'status' | 'date';
const FINANCE_SORT_ACCESSORS: Partial<Record<FinanceSortKey, (p: AdminPayment) => string | number | null | undefined>> = {
  item: (p) => p.itemTitle,
  renter: (p) => p.renterName,
  owner: (p) => p.ownerName,
  total: (p) => p.totalAmount,
  status: (p) => p.status,
  date: (p) => p.createdAt,
};

function FinanceTab({ toast }: { toast: ToastFn }) {
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

type ActivitySortKey = 'date' | 'action' | 'target' | 'author';
const ACTIVITY_SORT_ACCESSORS: Partial<Record<ActivitySortKey, (e: ActivityLogEntry) => string | number | null | undefined>> = {
  date: (e) => e.performedAt,
  action: (e) => e.actionLabel,
  target: (e) => e.targetTitle,
  author: (e) => e.performedByName,
};

function ActivityLogTab() {
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
            <span style={{ fontWeight: 400, fontSize: 13, color: '#64748b', marginLeft: 8 }}>
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
                    <td style={{ fontSize: 13, color: '#64748b', maxWidth: 200 }}>
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

/* ═══════════════════════════════════════════════════════════════════════════
   COMPLAINTS TAB (admin view)
   ═══════════════════════════════════════════════════════════════════════════ */

const COMPLAINT_PRIORITY_MAP: Record<ComplaintPriority, { label: string; cls: string }> = {
  low: { label: 'Низкий', cls: s.badgeGray },
  medium: { label: 'Средний', cls: s.badgeOrange },
  high: { label: 'Высокий', cls: s.badgeRed },
  critical: { label: 'Критический', cls: s.badgePurple },
};

const COMPLAINT_STATUS_MAP: Record<ComplaintStatus, { label: string; cls: string }> = {
  new: { label: 'Новая', cls: s.badgeBlue },
  in_review: { label: 'На рассмотрении', cls: s.badgeOrange },
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

function AdminComplaintsTab({ toast }: { toast: ToastFn }) {
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
              <p style={{ fontSize: 14, color: '#334155', marginTop: 4, lineHeight: 1.6 }}>
                {c.selectedComplaint.reason}
              </p>
            </div>
            <div style={{ marginTop: 8 }}>
              <span className={s.detailLabel}>Описание</span>
              <p style={{ fontSize: 14, color: '#334155', marginTop: 4, lineHeight: 1.6 }}>
                {c.selectedComplaint.description}
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

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT — AdminPanel
   ═══════════════════════════════════════════════════════════════════════════ */

export function AdminPanel({ activeTab = 'dashboard' as AdminTab }: { activeTab?: AdminTab }) {
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
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'users' && <UsersTab toast={toast.show} />}
          {activeTab === 'listings' && <ListingsTab toast={toast.show} />}
          {activeTab === 'deals' && <DealsTab toast={toast.show} />}
          {activeTab === 'finance' && <FinanceTab toast={toast.show} />}
          {activeTab === 'complaints' && <AdminComplaintsTab toast={toast.show} />}
          {activeTab === 'activity' && <ActivityLogTab />}
          {activeTab === 'settings' && <SettingsTab toast={toast.show} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
