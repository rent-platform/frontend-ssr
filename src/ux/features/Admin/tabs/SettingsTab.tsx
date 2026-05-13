'use client';

import { Save, ToggleLeft, ToggleRight } from 'lucide-react';
import clsx from 'clsx';
import s from '../../../layouts/AdminLayout/AdminLayout.module.scss';
import { useAdminSettings } from '../hooks/useAdminSettings';
import { TableSkeleton } from '../components/Skeletons';
import type { ToastFn } from '@/ux/components/Toast';

export function SettingsTab({ toast }: { toast: ToastFn }) {
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
