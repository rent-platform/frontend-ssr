'use client';

import { mapCatalogShortItemToCardVM, useFetchMyAdsQuery } from '@/business/ads';
import { Package } from 'lucide-react';
import { CatalogCard } from '../../Catalog';
import clsx from 'clsx';
import { pluralize } from '@/ux/utils';
import { LISTING_FILTERS } from '../profileHelpers';
import type { ListingFilter } from '../profileHelpers';
import { EmptyState } from './EmptyState';
import styles from '../ProfileDashboard.module.scss';

export function ListingsPanel({ filter, onFilterChange }: { filter: ListingFilter; onFilterChange: (f: ListingFilter) => void }) {
  const { data, isLoading, isFetching, isError } = useFetchMyAdsQuery({
    pageSize: 50,
    status: filter === 'all' ? undefined : filter,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  const listings = (data?.content ?? []).map((item) => ({
    ...mapCatalogShortItemToCardVM(item),
    isFavorite: item.isFavorite ?? false,
    city: item.city ?? undefined,
  }));
  const total = data?.totalElements ?? listings.length;
  const isPending = isLoading || isFetching;

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2 className={styles.panelTitle}>Мои объявления</h2>
          <p className={styles.panelSubtitle}>{total} {pluralize(total, 'объявление', 'объявления', 'объявлений')}</p>
        </div>
        <div className={styles.filterPills}>
          {LISTING_FILTERS.map((f) => (
            <button key={f.value} type="button" className={clsx(styles.filterPill, filter === f.value && styles.filterPillActive, styles.tooltipWrap)} onClick={() => onFilterChange(f.value)}>
              {f.label}
              <span className={styles.tooltipBubble}>{f.tip}</span>
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <EmptyState icon={<Package />} title="Загружаем объявления" text="Получаем ваши объявления с backend" />
      ) : isError ? (
        <EmptyState icon={<Package />} title="Не удалось загрузить объявления" text="Проверьте авторизацию и backend" />
      ) : listings.length === 0 ? (
        <EmptyState icon={<Package />} title="Нет объявлений" text="По этому фильтру ничего не найдено" />
      ) : (
        <div className={styles.listingsGrid}>
          {listings.map((item, i) => (
            <CatalogCard
              key={item.id}
              item={item}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
