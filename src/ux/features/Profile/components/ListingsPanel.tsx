'use client';

import { useMemo } from 'react';
import { Package } from 'lucide-react';
import { CatalogCard } from '../../Catalog';
import { pluralize } from '@/ux/utils';
import { MOCK_LISTINGS } from '../mockProfileData';
import { LISTING_FILTERS, profileListingToCatalogItem } from '../profileHelpers';
import type { ListingFilter } from '../profileHelpers';
import styles from '../ProfileDashboard.module.scss';

function EmptyState({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyText}>{text}</p>
    </div>
  );
}

export function ListingsPanel({ filter, onFilterChange }: { filter: ListingFilter; onFilterChange: (f: ListingFilter) => void }) {
  const filtered = useMemo(() => (filter === 'all' ? MOCK_LISTINGS : MOCK_LISTINGS.filter((l) => l.status === filter)), [filter]);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Мои объявления</h2>
          <p className={styles.panelSubtitle}>{filtered.length} {pluralize(filtered.length, 'объявление', 'объявления', 'объявлений')}</p>
        </div>
        <div className={styles.filterPills}>
          {LISTING_FILTERS.map((f) => (
            <button key={f.value} type="button" className={`${styles.filterPill} ${filter === f.value ? styles.filterPillActive : ''} ${styles.tooltipWrap}`} onClick={() => onFilterChange(f.value)}>
              {f.label}
              <span className={styles.tooltipBubble}>{f.tip}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Package />} title="Нет объявлений" text="По этому фильтру ничего не найдено" />
      ) : (
        <div className={styles.listingsGrid}>
          {filtered.map((item, i) => (
            <CatalogCard
              key={item.id}
              item={profileListingToCatalogItem(item)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
