'use client';

import clsx from 'clsx';
import {
  Users,
  ShoppingBag,
  Handshake,
  Banknote,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
} from 'lucide-react';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { StatsSkeleton } from '../components/Skeletons';
import { MiniBarChart } from '../components/MiniBarChart';
import { formatPrice, formatMoney, DEAL_STATUS_MAP } from '../helpers';
import { mockAnalyticsData, mockTodayActivity } from '../mockAdminData';

export function DashboardTab() {
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
