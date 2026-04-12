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
  Truck,
  User,
  Wallet,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Tabs } from '../../../components/Tabs/Tabs';
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

const quickFilterIcons: Record<(typeof QUICK_FILTER_OPTIONS)[number], LucideIcon> = {
  'С доставкой': Truck,
  'Рядом сегодня': Zap,
  'Без залога': ShieldCheck,
  'Топ-рейтинг': Sparkles,
  Новинки: Sparkles,
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

const FILTER_SECTIONS = [
  { value: 'main', label: 'Основное', icon: Search },
  { value: 'terms', label: 'Условия', icon: Compass },
  { value: 'extras', label: 'Быстро', icon: Sparkles },
] as const;

export function CatalogFilters({
  filters,
  resultsCount,
  onChange,
  onReset,
  onClose,
}: CatalogFiltersProps) {
  const [activeSection, setActiveSection] = useState<FilterSectionKey>('main');

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

  const handleConditionToggle = (value: string) => {
    const next = filters.condition.includes(value)
      ? filters.condition.filter((item) => item !== value)
      : [...filters.condition, value];

    onChange({ condition: next });
  };

  const handleQuickFilterToggle = (value: string) => {
    onChange({ quickFilter: filters.quickFilter === value ? null : value });
  };

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
              <span className={styles.modalEyebrow}>Large Filters</span>
              <h3>Фильтры поиска</h3>
              <p>Крупная модальная панель для точной настройки выдачи без визуального шума.</p>
            </div>
          </div>

          <div className={styles.sidebarActions}>
            <button
              type="button"
              onClick={() => {
                onReset();
                setActiveSection('main');
              }}
              className={styles.resetButton}
              title="Очистить всё"
            >
              <RotateCcw size={18} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className={styles.closeButton}
              title="Закрыть"
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

          <div className={styles.modalBadge}>
            <Sparkles size={16} />
            <span>
              Активно фильтров <strong>{activeFiltersCount}</strong>
            </span>
          </div>
        </div>

        <div className={styles.modalIntro}>
          <div className={styles.modalIntroIcon}>
            <Compass size={18} />
          </div>
          <div className={styles.modalIntroContent}>
            <strong>Быстро переключайся между разделами</strong>
            <p>Основные параметры, условия аренды и быстрые сценарии собраны в отдельных вкладках с underline-навигацией.</p>
          </div>
        </div>

        <Tabs
          items={FILTER_SECTIONS}
          value={activeSection}
          onChange={setActiveSection}
          variant="underline"
          className={styles.filterTabs}
        />

        <div className={styles.scrollableContent}>
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
                  </div>
                  <div className={styles.priceFields}>
                    <div className={styles.priceInputWrap}>
                      <span className={styles.priceInputLabel}>От</span>
                      <input
                        value={filters.minPrice}
                        onChange={(event) => onChange({ minPrice: event.target.value })}
                        placeholder="0"
                        inputMode="numeric"
                      />
                      <span className={styles.currency}>₽</span>
                    </div>

                    <div className={styles.priceInputWrap}>
                      <span className={styles.priceInputLabel}>До</span>
                      <input
                        value={filters.maxPrice}
                        onChange={(event) => onChange({ maxPrice: event.target.value })}
                        placeholder="Без лимита"
                        inputMode="numeric"
                      />
                      <span className={styles.currency}>₽</span>
                    </div>
                  </div>
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
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
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
                <section className={styles.filterGroup}>
                  <div className={styles.filterLabelRow}>
                    <Sparkles size={18} />
                    <span className={styles.filterLabel}>Быстрые сценарии</span>
                  </div>

                  <div className={styles.quickFilterGrid}>
                    {QUICK_FILTER_OPTIONS.map((option) => {
                      const Icon = quickFilterIcons[option];
                      const active = filters.quickFilter === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          className={active ? styles.quickFilterCardActive : styles.quickFilterCard}
                          onClick={() => handleQuickFilterToggle(option)}
                        >
                          <Icon size={18} />
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className={styles.filterGroup}>
                  <div className={styles.filterLabelRow}>
                    <Zap size={18} />
                    <span className={styles.filterLabel}>Дополнительно</span>
                  </div>

                  <div className={styles.switchesGrid}>
                    <label className={styles.fancyCheckbox}>
                      <input
                        type="checkbox"
                        checked={filters.onlyAvailable}
                        onChange={(event) => onChange({ onlyAvailable: event.target.checked })}
                      />
                      <div className={styles.checkboxContent}>
                        <CalendarCheck size={18} />
                        <span>Доступно сегодня</span>
                        <div className={styles.checkMark}>
                          <CheckCircle2 size={16} />
                        </div>
                      </div>
                    </label>

                    <label className={styles.fancyCheckbox}>
                      <input
                        type="checkbox"
                        checked={filters.hasDeposit === 'no'}
                        onChange={(event) => onChange({ hasDeposit: event.target.checked ? 'no' : 'all' })}
                      />
                      <div className={styles.checkboxContent}>
                        <ShieldCheck size={18} />
                        <span>Без залога</span>
                        <div className={styles.checkMark}>
                          <CheckCircle2 size={16} />
                        </div>
                      </div>
                    </label>
                  </div>
                </section>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className={styles.filtersFooter}>
          <div className={styles.footerStats}>
            <span>
              Готово к просмотру: <strong>{resultsCount}</strong> {getAnnouncementsLabel(resultsCount)}
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
            <span>Применить фильтры</span>
          </motion.button>
        </div>
      </motion.aside>
    </motion.div>
  );
}
