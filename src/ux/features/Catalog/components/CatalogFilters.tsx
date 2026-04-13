'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarCheck,
  CheckCircle2,
  Compass,
  LayoutGrid,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  User,
  Wallet,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Tabs, type TabsItem } from '../../../components/Tabs/Tabs';
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
};

type FilterSectionKey = 'main' | 'terms' | 'extras';

const CONDITION_OPTIONS = [
  { value: 'new', label: 'Новое', emoji: '✨' },
  { value: 'like_new', label: 'Как новое', emoji: '👌' },
  { value: 'used', label: 'Б/У', emoji: '♻️' },
] as const;

const OWNER_TYPES = [
  { value: 'all', label: 'Все', icon: LayoutGrid },
  { value: 'private', label: 'Частные', icon: User },
  { value: 'pro', label: 'Профи', icon: ShieldCheck },
] as const;

const DELIVERY_TYPES = [
  { value: 'all', label: 'Любой', icon: LayoutGrid },
  { value: 'pickup', label: 'Самовывоз', icon: MapPin },
  { value: 'delivery', label: 'Доставка', icon: Truck },
] as const;

const DEPOSIT_OPTIONS = [
  { value: 'all', label: 'Любой' },
  { value: 'no', label: 'Без залога' },
  { value: 'yes', label: 'С залогом' },
] as const;

const quickFilterIcons: Record<(typeof QUICK_FILTER_OPTIONS)[number], LucideIcon> = {
  'С доставкой': Truck,
  'Рядом сегодня': Zap,
  'Без залога': ShieldCheck,
  'Топ-рейтинг': Star,
  Новинки: Sparkles,
};

const quickFilterMeta: Record<
  (typeof QUICK_FILTER_OPTIONS)[number],
  { title: string; description: string; tone: 'delivery' | 'near' | 'deposit' | 'top' | 'new' }
> = {
  'С доставкой': {
    title: 'С доставкой',
    description: 'Привезут к двери или в удобную точку',
    tone: 'delivery',
  },
  'Рядом сегодня': {
    title: 'Рядом сегодня',
    description: 'Быстро забрать — без ожиданий',
    tone: 'near',
  },
  'Без залога': {
    title: 'Без залога',
    description: 'Без блокировок и лишних платежей',
    tone: 'deposit',
  },
  'Топ-рейтинг': {
    title: 'Топ-рейтинг',
    description: 'Проверенные арендодатели и отзывы',
    tone: 'top',
  },
  Новинки: {
    title: 'Новинки',
    description: 'Свежие объявления и новые вещи',
    tone: 'new',
  },
};

const categoryOptions: GlassSelectOption[] = CATEGORY_OPTIONS.map((option) => ({
  value: option,
  label: option,
}));

const cityOptions: GlassSelectOption[] = [
  {
    value: 'Все города',
    label: 'Все города России',
    description: 'Показывать объявления без ограничения по городу',
    searchText: 'все города России',
  },
  ...RUSSIAN_CITY_OPTIONS.map((city) => ({
    value: city.value,
    label: city.value,
    description: city.region,
    searchText: city.searchText,
  })),
];

const FILTER_SECTIONS: TabsItem<FilterSectionKey>[] = [
  { value: 'main', label: 'Основное', icon: Search },
  { value: 'terms', label: 'Условия', icon: Compass },
  { value: 'extras', label: 'Быстро', icon: Sparkles },
];

function normalizePriceValue(value: string) {
  return value.replace(/[^\d]/g, '').slice(0, 10);
}

function formatPriceDisplay(value: string): string {
  if (!value) return '';
  return new Intl.NumberFormat('ru-RU').format(Number(value));
}

/* ─── Toggle Switch ─── */
function ToggleSwitch({
  checked,
  onChange: onToggle,
  label,
  description,
  icon: Icon,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  icon: LucideIcon;
}) {
  return (
    <label className={styles.toggleRow}>
      <span className={styles.toggleInfo}>
        <span className={styles.toggleIconWrap}>
          <Icon size={18} />
        </span>
        <span className={styles.toggleText}>
          <span className={styles.toggleLabel}>{label}</span>
          {description ? <span className={styles.toggleDesc}>{description}</span> : null}
        </span>
      </span>
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        className={checked ? styles.toggleTrackActive : styles.toggleTrack}
        onClick={() => onToggle(!checked)}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(!checked); } }}
      >
        <motion.span
          className={styles.toggleThumb}
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} className={styles.srOnly} />
    </label>
  );
}

export function CatalogFilters({
  filters,
  resultsCount,
  onChange,
  onReset,
  onClose,
}: CatalogFiltersProps) {
  const [activeSection, setActiveSection] = useState<FilterSectionKey>('main');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (filters.category !== INITIAL_FILTERS.category) count += 1;
    if (filters.city !== INITIAL_FILTERS.city) count += 1;
    if (filters.minPrice) count += 1;
    if (filters.maxPrice) count += 1;
    if (filters.condition.length > 0) count += 1;
    if (filters.ownerType !== INITIAL_FILTERS.ownerType) count += 1;
    if (filters.deliveryType !== INITIAL_FILTERS.deliveryType) count += 1;
    if (filters.quickFilter !== INITIAL_FILTERS.quickFilter) count += 1;
    if (filters.onlyAvailable !== INITIAL_FILTERS.onlyAvailable) count += 1;
    if (filters.hasDeposit !== INITIAL_FILTERS.hasDeposit) count += 1;

    return count;
  }, [filters]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{
      key: string;
      label: string;
      icon: LucideIcon;
      onRemove: () => void;
    }> = [];

    if (filters.city !== INITIAL_FILTERS.city) {
      chips.push({
        key: `city-${filters.city}`,
        label: filters.city,
        icon: MapPin,
        onRemove: () => onChange({ city: INITIAL_FILTERS.city }),
      });
    }

    if (filters.category !== INITIAL_FILTERS.category) {
      chips.push({
        key: `category-${filters.category}`,
        label: filters.category,
        icon: LayoutGrid,
        onRemove: () => onChange({ category: INITIAL_FILTERS.category }),
      });
    }

    if (filters.minPrice || filters.maxPrice) {
      const minLabel = filters.minPrice ? `от ${formatPriceDisplay(filters.minPrice)} ₽` : '';
      const maxLabel = filters.maxPrice ? `до ${formatPriceDisplay(filters.maxPrice)} ₽` : '';
      chips.push({
        key: `price-${filters.minPrice}-${filters.maxPrice}`,
        label: [minLabel, maxLabel].filter(Boolean).join(' · '),
        icon: Wallet,
        onRemove: () => onChange({ minPrice: '', maxPrice: '' }),
      });
    }

    if (filters.condition.length > 0) {
      const conditionLabels: Record<string, string> = {
        new: 'Новое',
        like_new: 'Как новое',
        used: 'Б/У',
      };

      filters.condition.forEach((value) => {
        chips.push({
          key: `condition-${value}`,
          label: conditionLabels[value] ?? value,
          icon: Sparkles,
          onRemove: () =>
            onChange({
              condition: filters.condition.filter((item) => item !== value),
            }),
        });
      });
    }

    if (filters.ownerType !== INITIAL_FILTERS.ownerType) {
      const ownerLabels: Record<string, string> = {
        all: 'Все владельцы',
        private: 'Частные',
        pro: 'Профи',
      };
      chips.push({
        key: `owner-${filters.ownerType}`,
        label: ownerLabels[filters.ownerType as string] ?? String(filters.ownerType),
        icon: User,
        onRemove: () => onChange({ ownerType: INITIAL_FILTERS.ownerType }),
      });
    }

    if (filters.deliveryType !== INITIAL_FILTERS.deliveryType) {
      const deliveryLabels: Record<string, string> = {
        all: 'Любой способ',
        pickup: 'Самовывоз',
        delivery: 'Доставка',
      };
      chips.push({
        key: `delivery-${filters.deliveryType}`,
        label: deliveryLabels[filters.deliveryType as string] ?? String(filters.deliveryType),
        icon: Truck,
        onRemove: () => onChange({ deliveryType: INITIAL_FILTERS.deliveryType }),
      });
    }

    if (filters.onlyAvailable !== INITIAL_FILTERS.onlyAvailable) {
      chips.push({
        key: `availability-${String(filters.onlyAvailable)}`,
        label: 'Доступно сейчас',
        icon: CalendarCheck,
        onRemove: () => onChange({ onlyAvailable: INITIAL_FILTERS.onlyAvailable }),
      });
    }

    if (filters.hasDeposit !== INITIAL_FILTERS.hasDeposit) {
      chips.push({
        key: `deposit-${String(filters.hasDeposit)}`,
        label: filters.hasDeposit === 'no' ? 'Без залога' : 'С залогом',
        icon: ShieldCheck,
        onRemove: () => onChange({ hasDeposit: INITIAL_FILTERS.hasDeposit }),
      });
    }

    if (filters.quickFilter) {
      const qf = filters.quickFilter as (typeof QUICK_FILTER_OPTIONS)[number];
      const Icon = quickFilterIcons[qf] ?? Sparkles;
      chips.push({
        key: `quick-${filters.quickFilter}`,
        label: filters.quickFilter,
        icon: Icon,
        onRemove: () => onChange({ quickFilter: INITIAL_FILTERS.quickFilter }),
      });
    }

    return chips;
  }, [filters, onChange]);

  const handleConditionToggle = (value: string) => {
    const next = filters.condition.includes(value)
      ? filters.condition.filter((item) => item !== value)
      : [...filters.condition, value];

    onChange({ condition: next });
  };

  const handleQuickFilterToggle = (value: string) => {
    onChange({ quickFilter: filters.quickFilter === value ? null : value });
  };

  const priceHint = useMemo(() => {
    if (filters.minPrice && filters.maxPrice) {
      return `${formatPriceDisplay(filters.minPrice)} — ${formatPriceDisplay(filters.maxPrice)} ₽/день`;
    }
    if (filters.minPrice) return `от ${formatPriceDisplay(filters.minPrice)} ₽/день`;
    if (filters.maxPrice) return `до ${formatPriceDisplay(filters.maxPrice)} ₽/день`;
    return null;
  }, [filters.minPrice, filters.maxPrice]);

  return (
    <motion.div
      className={styles.sidebar}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    >
      <motion.aside
        id="catalog-filters-panel"
        className={styles.sidebarCard}
        role="dialog"
        aria-modal="true"
        aria-label="Фильтры поиска"
        initial={{ opacity: 0, y: 36, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 28, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.sidebarTitleRow}>
          <div className={styles.titleWithIcon}>
            <div className={styles.titleIcon}>
              <SlidersHorizontal size={20} />
            </div>
            <div className={styles.modalTitleCopy}>
              <span className={styles.modalEyebrow}>Каталог</span>
              <h3>Фильтры</h3>
              <p>Настрой выдачу по городу, цене и условиям аренды</p>
            </div>
          </div>

          <div className={styles.sidebarActions}>
            {activeFiltersCount > 0 ? (
              <motion.button
                type="button"
                onClick={() => {
                  onReset();
                  setActiveSection('main');
                  scrollToTop();
                }}
                className={styles.resetButton}
                title="Очистить всё"
                aria-label="Очистить все фильтры"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw size={18} />
              </motion.button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className={styles.closeButton}
              title="Закрыть"
              aria-label="Закрыть фильтры"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className={styles.modalMetaRow}>
          <div className={styles.modalBadge}>
            <Search size={16} />
            <span>
              Найдено <strong>{resultsCount}</strong> {getAnnouncementsLabel(resultsCount)}
            </span>
          </div>

          {activeFiltersCount > 0 ? (
            <div className={styles.modalBadgeActive}>
              <SlidersHorizontal size={14} />
              <span>
                <strong>{activeFiltersCount}</strong> {activeFiltersCount === 1 ? 'фильтр' : activeFiltersCount < 5 ? 'фильтра' : 'фильтров'}
              </span>
            </div>
          ) : null}
        </div>

        <AnimatePresence>
          {activeFilterChips.length > 0 ? (
            <motion.div
              className={styles.activeFiltersRow}
              aria-label="Активные фильтры"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.activeFiltersList}>
                {activeFilterChips.map((chip) => (
                  <motion.button
                    key={chip.key}
                    type="button"
                    className={styles.activeFilterChip}
                    onClick={chip.onRemove}
                    title="Убрать фильтр"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layout
                  >
                    <chip.icon size={14} />
                    <span>{chip.label}</span>
                    <X size={14} />
                  </motion.button>
                ))}
              </div>
              <button
                type="button"
                className={styles.resetInline}
                onClick={() => {
                  onReset();
                  setActiveSection('main');
                  scrollToTop();
                }}
              >
                Сбросить
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Tabs
          items={FILTER_SECTIONS}
          value={activeSection}
          onChange={(v) => { setActiveSection(v); scrollToTop(); }}
          variant="underline"
          className={styles.filterTabs}
        />

        <div className={styles.scrollableContent} ref={scrollRef}>
          <AnimatePresence mode="wait">
            {activeSection === 'main' ? (
              <motion.div
                key="main"
                className={styles.tabPanel}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.22 }}
              >
                <div className={styles.gridSection}>
                  <section className={styles.filterGroup}>
                    <div className={styles.filterLabelRow}>
                      <LayoutGrid size={18} />
                      <span className={styles.filterLabel}>Категория</span>
                    </div>
                    <GlassSelect
                      label="Категория"
                      value={filters.category}
                      options={categoryOptions}
                      onChange={(value) => onChange({ category: value })}
                    />
                  </section>

                  <section className={styles.filterGroup}>
                    <div className={styles.filterLabelRow}>
                      <MapPin size={18} />
                      <span className={styles.filterLabel}>Город поиска</span>
                    </div>
                    <GlassSelect
                      label="Город"
                      value={filters.city}
                      options={cityOptions}
                      onChange={(value) => onChange({ city: value })}
                      searchable
                      searchPlaceholder="Начните вводить город..."
                      dropdownClassName={styles.cityDropdown}
                    />
                  </section>
                </div>

                <section className={`${styles.filterGroup} ${styles.filterGroupWide}`}>
                  <div className={styles.filterLabelRow}>
                    <Wallet size={18} />
                    <span className={styles.filterLabel}>Стоимость аренды</span>
                    {priceHint ? (
                      <span className={styles.priceHintBadge}>{priceHint}</span>
                    ) : null}
                  </div>
                  <div className={styles.priceFields}>
                    <div className={styles.priceInputWrap}>
                      <span className={styles.priceInputLabel}>От</span>
                      <input
                        type="text"
                        value={filters.minPrice}
                        onChange={(event) => onChange({ minPrice: normalizePriceValue(event.target.value) })}
                        placeholder="0"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-label="Минимальная цена"
                      />
                      <span className={styles.currency}>₽</span>
                    </div>

                    <div className={styles.priceInputWrap}>
                      <span className={styles.priceInputLabel}>До</span>
                      <input
                        type="text"
                        value={filters.maxPrice}
                        onChange={(event) => onChange({ maxPrice: normalizePriceValue(event.target.value) })}
                        placeholder="Без лимита"
                        inputMode="numeric"
                        autoComplete="off"
                        aria-label="Максимальная цена"
                      />
                      <span className={styles.currency}>₽</span>
                    </div>
                  </div>
                </section>

                <section className={`${styles.filterGroup} ${styles.filterGroupWide}`}>
                  <label className={styles.fancyCheckbox}>
                    <input
                      type="checkbox"
                      checked={filters.onlyAvailable}
                      onChange={(e) => onChange({ onlyAvailable: e.target.checked })}
                    />
                    <span className={styles.checkboxContent}>
                      <CalendarCheck size={20} />
                      <span>Доступно сейчас</span>
                      <span className={styles.checkMark}>
                        <CheckCircle2 size={14} />
                      </span>
                    </span>
                  </label>
                </section>
              </motion.div>
            ) : null}

            {activeSection === 'terms' ? (
              <motion.div
                key="terms"
                className={styles.tabPanel}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.22 }}
              >
                <section className={styles.filterGroup}>
                  <div className={styles.filterLabelRow}>
                    <Sparkles size={18} />
                    <span className={styles.filterLabel}>Состояние вещи</span>
                  </div>
                  <div className={styles.conditionChips}>
                    {CONDITION_OPTIONS.map((option) => {
                      const active = filters.condition.includes(option.value);

                      return (
                        <motion.button
                          key={option.value}
                          type="button"
                          className={active ? styles.conditionChipActive : styles.conditionChip}
                          onClick={() => handleConditionToggle(option.value)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>{option.emoji}</span>
                          <span>{option.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </section>

                <div className={styles.gridSection}>
                  <section className={styles.filterGroup}>
                    <div className={styles.filterLabelRow}>
                      <User size={18} />
                      <span className={styles.filterLabel}>Тип владельца</span>
                    </div>
                    <div className={styles.segmentedControl}>
                      {OWNER_TYPES.map((option) => {
                        const active = filters.ownerType === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={active ? styles.segmentActive : styles.segment}
                            onClick={() => onChange({ ownerType: option.value })}
                          >
                            <option.icon size={16} />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className={styles.filterGroup}>
                    <div className={styles.filterLabelRow}>
                      <Truck size={18} />
                      <span className={styles.filterLabel}>Способ получения</span>
                    </div>
                    <div className={styles.segmentedControl}>
                      {DELIVERY_TYPES.map((option) => {
                        const active = filters.deliveryType === option.value;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            className={active ? styles.segmentActive : styles.segment}
                            onClick={() => onChange({ deliveryType: option.value })}
                          >
                            <option.icon size={16} />
                            <span>{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>

                <section className={`${styles.filterGroup} ${styles.filterGroupWide}`}>
                  <div className={styles.filterLabelRow}>
                    <ShieldCheck size={18} />
                    <span className={styles.filterLabel}>Залог</span>
                  </div>
                  <div className={styles.segmentedControl}>
                    {DEPOSIT_OPTIONS.map((option) => {
                      const active = filters.hasDeposit === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={active ? styles.segmentActive : styles.segment}
                          onClick={() => onChange({ hasDeposit: option.value as CatalogFilterState['hasDeposit'] })}
                        >
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </motion.div>
            ) : null}

            {activeSection === 'extras' ? (
              <motion.div
                key="extras"
                className={styles.tabPanel}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.22 }}
              >
                <div className={styles.modalIntro}>
                  <div className={styles.modalIntroIcon}>
                    <Zap size={20} />
                  </div>
                  <div className={styles.modalIntroContent}>
                    <strong>Быстрые сценарии</strong>
                    <p>Выберите один из готовых наборов фильтров для типичных ситуаций аренды</p>
                  </div>
                </div>

                <section className={styles.filterGroup}>
                  <div className={styles.quickFilterGrid}>
                    {QUICK_FILTER_OPTIONS.map((option) => {
                      const meta = quickFilterMeta[option];
                      const Icon = quickFilterIcons[option];
                      const active = filters.quickFilter === option;

                      return (
                        <motion.button
                          key={option}
                          type="button"
                          aria-pressed={active}
                          className={`${active ? styles.quickFilterCardActive : styles.quickFilterCard} ${
                            meta.tone === 'delivery'
                              ? styles.quickFilterToneDelivery
                              : meta.tone === 'near'
                                ? styles.quickFilterToneNear
                                : meta.tone === 'deposit'
                                  ? styles.quickFilterToneDeposit
                                  : meta.tone === 'top'
                                    ? styles.quickFilterToneTop
                                    : styles.quickFilterToneNew
                          }`}
                          onClick={() => handleQuickFilterToggle(option)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className={styles.quickFilterIconWrap} aria-hidden="true">
                            <Icon size={16} />
                          </span>
                          <span className={styles.quickFilterText}>
                            <span className={styles.quickFilterTitle}>{meta.title}</span>
                            <span className={styles.quickFilterHint}>{meta.description}</span>
                          </span>
                          {active ? (
                            <motion.span
                              className={styles.quickFilterCheck}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            >
                              <CheckCircle2 size={18} />
                            </motion.span>
                          ) : null}
                        </motion.button>
                      );
                    })}
                  </div>
                </section>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className={styles.filtersFooter}>
          <div className={styles.footerStats}>
            <span>
              Найдено: <strong>{resultsCount}</strong> {getAnnouncementsLabel(resultsCount)}
            </span>
          </div>

          <motion.button
            type="button"
            className={styles.primaryAction}
            onClick={onClose}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Search size={18} />
            <span>Показать {resultsCount}</span>
          </motion.button>
        </div>
      </motion.aside>
    </motion.div>
  );
}
