'use client';

import {
  ArrowRight,
  Lock,
  PackageCheck,
} from 'lucide-react';
import {
  CatalogCard,
  CatalogSearchBar,
  CatalogToolbar,
  CategoryRail,
  CATEGORY_OPTIONS,
  type CatalogFilterState,
  type CatalogUiItem,
} from '../../Catalog';
import { GUEST_ITEM_LIMIT } from '../guestConstants';
import styles from '../GuestExperience.module.scss';

export type GuestCatalogSectionProps = {
  filters: CatalogFilterState;
  filteredItems: CatalogUiItem[];
  totalCount: number;
  isFiltersOpen: boolean;
  onToggleFilters: () => void;
  onCloseFilters: () => void;
  onUpdateFilters: (patch: Partial<CatalogFilterState>) => void;
  onResetFilters: () => void;
  onOpenItem: (item: CatalogUiItem) => void;
  onAuthRequired: () => void;
};

export function GuestCatalogSection({
  filters,
  filteredItems,
  totalCount,
  isFiltersOpen,
  onToggleFilters,
  onCloseFilters,
  onUpdateFilters,
  onResetFilters,
  onOpenItem,
  onAuthRequired,
}: GuestCatalogSectionProps) {
  return (
    <>
      {/* ═══════ Search Bar (shared with auth) ═══════ */}
      <section id="guest-catalog" className={styles.searchBarSection}>
        <CatalogSearchBar
          filters={filters}
          resultsCount={totalCount}
          isFiltersOpen={isFiltersOpen}
          onToggleFilters={onToggleFilters}
          onCloseFilters={onCloseFilters}
          onChange={onUpdateFilters}
          onResetFilters={onResetFilters}
        />
      </section>

      {/* ═══════ Categories ═══════ */}
      <section className={styles.categorySection}>
        <CategoryRail
          categories={CATEGORY_OPTIONS}
          activeCategory={filters.category}
          onCategoryChange={(category) => onUpdateFilters({ category })}
        />
      </section>

      {/* ═══════ Catalog ═══════ */}
      <section className={styles.catalogSection}>
        <CatalogToolbar
          filters={filters}
          onChange={onUpdateFilters}
          visibleCount={filteredItems.length}
          totalCount={totalCount}
        />

        {filteredItems.length > 0 ? (
          <div className={styles.catalogGridWrap}>
            <div className={styles.resultsGrid}>
              {filteredItems.map((item, index) => (
                <div key={item.id} className={styles.cardWrapper}>
                  <CatalogCard item={item} onOpen={onOpenItem} index={index} isGuest onFavoriteChange={() => onAuthRequired()} />
                </div>
              ))}
            </div>

            {totalCount > GUEST_ITEM_LIMIT && (
              <>
                <div className={styles.catalogFade} aria-hidden="true" />
                <div className={styles.showMoreWrap}>
                  <button type="button" className={styles.showMoreBtn} onClick={onAuthRequired}>
                    <span>Показать все {totalCount} предложений</span>
                    <ArrowRight size={16} />
                  </button>
                  <p className={styles.showMoreHint}>
                    <Lock size={13} />
                    Полный каталог доступен зарегистрированным пользователям
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <PackageCheck size={32} />
            <h3>Ничего не нашли</h3>
            <p>Попробуйте изменить параметры поиска или фильтры</p>
            <button
              type="button"
              className={styles.emptyStateBtn}
              onClick={() => {
                onUpdateFilters({ search: '', category: 'Все категории' });
              }}
            >
              Сбросить всё
            </button>
          </div>
        )}
      </section>
    </>
  );
}
