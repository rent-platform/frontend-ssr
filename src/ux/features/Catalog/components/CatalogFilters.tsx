'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarCheck,
  Check,
  LayoutGrid,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  Wallet,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { CatalogFilterState } from '../types';
import {
  CATEGORY_OPTIONS,
  INITIAL_FILTERS,
  QUICK_FILTER_OPTIONS,
  getAnnouncementsLabel,
} from '../utils';
import { RUSSIAN_CITY_OPTIONS } from '../russianCities';
import { GlassSelect, type GlassSelectOption } from './GlassSelect';
import styles from './CatalogFilters.module.scss';

type CatalogFiltersProps = {
  filters: CatalogFilterState;
  resultsCount: number;
  onChange: (patch: Partial<CatalogFilterState>) => void;
  onReset: () => void;
  onClose: () => void;
  onConfirm?: () => void;
};

const EASE = [0.23, 1, 0.32, 1] as const;

const DEPOSIT_OPTIONS = [
  { value: 'all', label: 'Любой' },
  { value: 'no', label: 'Без залога' },
  { value: 'yes', label: 'С залогом' },
] as const;

const QUICK_FILTER_META: Record<
  (typeof QUICK_FILTER_OPTIONS)[number],
  { icon: LucideIcon; label: string }
> = {
  'Рядом сегодня': { icon: Zap, label: 'Доступно сегодня' },
  'С доставкой': { icon: Truck, label: 'С доставкой' },
  'Без залога': { icon: ShieldCheck, label: 'Без залога' },
  'Топ-рейтинг': { icon: Star, label: 'Топ-рейтинг' },
  Новинки: { icon: Sparkles, label: 'Новинки' },
};

const categoryOptions: GlassSelectOption[] = CATEGORY_OPTIONS.map((o) => ({ value: o, label: o }));

const cityOptions: GlassSelectOption[] = [
  { value: 'Все города', label: 'Все города России', description: 'Без ограничения по городу', searchText: 'все города России' },
  ...RUSSIAN_CITY_OPTIONS.map((c) => ({ value: c.value, label: c.value, description: c.region, searchText: c.searchText })),
];

function normalizePriceValue(v: string) { return v.replace(/[^\d]/g, '').slice(0, 10); }
function formatPriceDisplay(v: string): string { return v ? new Intl.NumberFormat('ru-RU').format(Number(v)) : ''; }

/* ─── Section label ─── */
function SectionLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className={styles.sectionLabel}>
      <Icon size={13} />
      <span>{children}</span>
    </div>
  );
}

/* ─── Toggle Switch ─── */
function ToggleSwitch({ checked, onChange: onToggle, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div className={styles.toggleRow} onClick={() => onToggle(!checked)}>
      <span className={styles.toggleText}>
        <span className={styles.toggleLabel}>{label}</span>
        {hint ? <span className={styles.toggleHint}>{hint}</span> : null}
      </span>
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        className={checked ? styles.toggleTrackOn : styles.toggleTrack}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(!checked); } }}
      >
        <motion.span className={styles.toggleThumb} layout transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
      </span>
    </div>
  );
}

/* ═══ Main component ═══ */
export function CatalogFilters({ filters, resultsCount, onChange, onReset, onClose, onConfirm }: CatalogFiltersProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.category !== INITIAL_FILTERS.category) n++;
    if (filters.city !== INITIAL_FILTERS.city) n++;
    if (filters.minPrice) n++;
    if (filters.maxPrice) n++;
    if (filters.quickFilter !== INITIAL_FILTERS.quickFilter) n++;
    if (filters.onlyAvailable !== INITIAL_FILTERS.onlyAvailable) n++;
    if (filters.hasDeposit !== INITIAL_FILTERS.hasDeposit) n++;
    return n;
  }, [filters]);

  const chips = useMemo(() => {
    const list: Array<{ key: string; label: string; icon: LucideIcon; onRemove: () => void }> = [];
    if (filters.city !== INITIAL_FILTERS.city) list.push({ key: 'city', label: filters.city, icon: MapPin, onRemove: () => onChange({ city: INITIAL_FILTERS.city }) });
    if (filters.category !== INITIAL_FILTERS.category) list.push({ key: 'cat', label: filters.category, icon: LayoutGrid, onRemove: () => onChange({ category: INITIAL_FILTERS.category }) });
    if (filters.minPrice || filters.maxPrice) {
      const parts = [filters.minPrice ? `от ${formatPriceDisplay(filters.minPrice)} ₽` : '', filters.maxPrice ? `до ${formatPriceDisplay(filters.maxPrice)} ₽` : ''].filter(Boolean);
      list.push({ key: 'price', label: parts.join(' – '), icon: Wallet, onRemove: () => onChange({ minPrice: '', maxPrice: '' }) });
    }
    if (filters.onlyAvailable !== INITIAL_FILTERS.onlyAvailable) list.push({ key: 'avail', label: 'Доступно сейчас', icon: CalendarCheck, onRemove: () => onChange({ onlyAvailable: INITIAL_FILTERS.onlyAvailable }) });
    if (filters.hasDeposit !== INITIAL_FILTERS.hasDeposit) list.push({ key: 'dep', label: filters.hasDeposit === 'no' ? 'Без залога' : 'С залогом', icon: ShieldCheck, onRemove: () => onChange({ hasDeposit: INITIAL_FILTERS.hasDeposit }) });
    if (filters.quickFilter) {
      const qf = filters.quickFilter as (typeof QUICK_FILTER_OPTIONS)[number];
      list.push({ key: 'qf', label: QUICK_FILTER_META[qf]?.label ?? filters.quickFilter, icon: QUICK_FILTER_META[qf]?.icon ?? Sparkles, onRemove: () => onChange({ quickFilter: null }) });
    }
    return list;
  }, [filters, onChange]);

  const handleReset = useCallback(() => {
    onReset();
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [onReset]);

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.aside
        id="catalog-filters-panel"
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Фильтры поиска"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.28, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}><SlidersHorizontal size={16} /></div>
            <h3 className={styles.headerTitle}>Фильтры</h3>
            {activeCount > 0 && (
              <span className={styles.headerBadge}>{activeCount}</span>
            )}
          </div>
          <div className={styles.headerRight}>
            {activeCount > 0 && (
              <button type="button" className={styles.resetBtn} onClick={handleReset} title="Сбросить все">
                <RotateCcw size={13} />
                <span>Сбросить</span>
              </button>
            )}
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Закрыть">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Active chips ── */}
        <AnimatePresence>
          {chips.length > 0 && (
            <motion.div
              className={styles.chipsRow}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              {chips.map((c) => (
                <motion.button key={c.key} type="button" className={styles.chip} onClick={c.onRemove} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <c.icon size={11} />
                  <span>{c.label}</span>
                  <X size={10} />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scrollable body ── */}
        <div className={styles.body} ref={scrollRef}>
          {/* Section: Поиск */}
          <div className={styles.section}>
            <SectionLabel icon={LayoutGrid}>Категория</SectionLabel>
            <GlassSelect label="Категория" value={filters.category} options={categoryOptions} onChange={(v) => onChange({ category: v })} triggerClassName={styles.compactTrigger} />
          </div>

          <div className={styles.section}>
            <SectionLabel icon={MapPin}>Город</SectionLabel>
            <GlassSelect label="Город" value={filters.city} options={cityOptions} onChange={(v) => onChange({ city: v })} searchable searchPlaceholder="Начните вводить город..." triggerClassName={styles.compactTrigger} dropdownClassName={styles.cityDropdown} />
          </div>

          <div className={styles.section}>
            <SectionLabel icon={Wallet}>Цена за сутки</SectionLabel>
            <div className={styles.priceRow}>
              <div className={styles.priceInput}>
                <span className={styles.pricePrefix}>от</span>
                <input type="text" value={filters.minPrice} onChange={(e) => onChange({ minPrice: normalizePriceValue(e.target.value) })} placeholder="0" inputMode="numeric" autoComplete="off" aria-label="Минимальная цена" />
                <span className={styles.priceSuffix}>₽</span>
              </div>
              <span className={styles.priceDash}>—</span>
              <div className={styles.priceInput}>
                <span className={styles.pricePrefix}>до</span>
                <input type="text" value={filters.maxPrice} onChange={(e) => onChange({ maxPrice: normalizePriceValue(e.target.value) })} placeholder="∞" inputMode="numeric" autoComplete="off" aria-label="Максимальная цена" />
                <span className={styles.priceSuffix}>₽</span>
              </div>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Section: Условия */}
          <div className={styles.section}>
            <ToggleSwitch checked={filters.onlyAvailable} onChange={(v) => onChange({ onlyAvailable: v })} label="Только доступные сейчас" hint="Скрыть вещи, которые сейчас заняты" />
          </div>

          <div className={styles.section}>
            <SectionLabel icon={ShieldCheck}>Залог</SectionLabel>
            <div className={styles.segmented}>
              {DEPOSIT_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" className={filters.hasDeposit === opt.value ? styles.segBtnActive : styles.segBtn} onClick={() => onChange({ hasDeposit: opt.value as CatalogFilterState['hasDeposit'] })}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <hr className={styles.divider} />

          {/* Section: Quick filters */}
          <div className={styles.section}>
            <SectionLabel icon={Zap}>Быстрые фильтры</SectionLabel>
            <div className={styles.quickGrid}>
              {QUICK_FILTER_OPTIONS.map((option) => {
                const meta = QUICK_FILTER_META[option];
                const Icon = meta.icon;
                const active = filters.quickFilter === option;
                return (
                  <button key={option} type="button" className={active ? styles.quickChipActive : styles.quickChip} onClick={() => onChange({ quickFilter: filters.quickFilter === option ? null : option })}>
                    <Icon size={12} />
                    <span>{meta.label}</span>
                    {active && <Check size={12} className={styles.quickChipCheck} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <span className={styles.footerCount}>
            {resultsCount} {getAnnouncementsLabel(resultsCount)}
          </span>
          <motion.button type="button" className={styles.applyBtn} onClick={onConfirm ?? onClose} whileTap={{ scale: 0.98 }}>
            <Search size={13} />
            Показать результаты
          </motion.button>
        </div>
      </motion.aside>
    </motion.div>
  );
}
