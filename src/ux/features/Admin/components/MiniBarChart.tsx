'use client';

import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';
import type { ChartPoint } from '../types';

export function MiniBarChart({ data, color = '#22c55e', formatValue }: { data: ChartPoint[]; color?: string; formatValue?: (v: number) => string }) {
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
