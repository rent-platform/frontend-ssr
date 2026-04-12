import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  X, 
  LayoutGrid, 
  MapPin, 
  Zap, 
  Wallet, 
  CheckCircle2,
  CalendarCheck,
  User,
  Truck,
  ShieldCheck,
  Sparkles,
  Search
} from 'lucide-react';
import type { CatalogFilterState } from '../types';
import {
  CATEGORY_OPTIONS,
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
  isMobileOpen?: boolean;
};

const CONDITION_OPTIONS = [
  { value: 'new', label: 'Новое', emoji: '✨' },
  { value: 'like_new', label: 'Как новое', emoji: '👍' },
  { value: 'used', label: 'Б/У', emoji: '♻️' },
];

const OWNER_TYPES = [
  { value: 'all', label: 'Все', icon: LayoutGrid },
  { value: 'private', label: 'Частные', icon: User },
  { value: 'pro', label: 'Профи', icon: ShieldCheck },
];

const DELIVERY_TYPES = [
  { value: 'all', label: 'Любой', icon: LayoutGrid },
  { value: 'pickup', label: 'Самовывоз', icon: MapPin },
  { value: 'delivery', label: 'Доставка', icon: Truck },
];

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

export function CatalogFilters({
  filters,
  resultsCount,
  onChange,
  onReset,
  onClose,
  isMobileOpen = false,
}: CatalogFiltersProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const handleConditionToggle = (val: string) => {
    const next = filters.condition.includes(val)
      ? filters.condition.filter((v) => v !== val)
      : [...filters.condition, val];
    onChange({ condition: next });
  };

  return (
    <motion.aside 
      className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ''}`}
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <motion.div
        className={styles.sidebarCard}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className={styles.sidebarTitleRow} variants={itemVariants}>
          <div className={styles.titleWithIcon}>
            <SlidersIcon />
            <h3>Фильтры поиска</h3>
          </div>
          <div className={styles.sidebarActions}>
            <motion.button
              type="button"
              onClick={onReset}
              className={styles.resetButton}
              title="Очистить всё"
              whileHover={{ rotate: -180 }}
              transition={{ duration: 0.5 }}
            >
              <RotateCcw size={18} />
            </motion.button>
            <button
              type="button"
              onClick={onClose}
              className={styles.closeButton}
              title="Закрыть"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>

        <div className={styles.scrollableContent}>
          {/* Категория и Город */}
          <div className={styles.gridSection}>
            <motion.div className={styles.filterGroup} variants={itemVariants}>
              <div className={styles.filterLabelRow}>
                <LayoutGrid size={16} />
                <span className={styles.filterLabel}>Категория</span>
              </div>
              <GlassSelect
                label="Категория"
                value={filters.category}
                options={categoryOptions}
                onChange={(value) => onChange({ category: value })}
              />
            </motion.div>

            <motion.div className={styles.filterGroup} variants={itemVariants}>
              <div className={styles.filterLabelRow}>
                <MapPin size={16} />
                <span className={styles.filterLabel}>Город поиска</span>
              </div>
              <GlassSelect
                label="Город"
                value={filters.city}
                options={cityOptions}
                onChange={(value) => onChange({ city: value })}
                searchable
                searchPlaceholder="Начните вводить..."
                dropdownClassName={styles.cityDropdown}
              />
            </motion.div>
          </div>

          {/* Стоимость */}
          <motion.div className={styles.filterGroup} variants={itemVariants}>
            <div className={styles.filterLabelRow}>
              <Wallet size={16} />
              <span className={styles.filterLabel}>Стоимость аренды</span>
            </div>
            <div className={styles.priceFields}>
              <div className={styles.priceInputWrap}>
                <span className={styles.priceInputLabel}>От</span>
                <input
                  value={filters.minPrice}
                  onChange={(e) => onChange({ minPrice: e.target.value })}
                  placeholder="0"
                  inputMode="numeric"
                />
                <span className={styles.currency}>₽</span>
              </div>
              <div className={styles.priceInputWrap}>
                <span className={styles.priceInputLabel}>До</span>
                <input
                  value={filters.maxPrice}
                  onChange={(e) => onChange({ maxPrice: e.target.value })}
                  placeholder="Без лимита"
                  inputMode="numeric"
                />
                <span className={styles.currency}>₽</span>
              </div>
            </div>
          </motion.div>

          {/* Состояние вещи */}
          <motion.div className={styles.filterGroup} variants={itemVariants}>
            <div className={styles.filterLabelRow}>
              <Sparkles size={16} />
              <span className={styles.filterLabel}>Состояние вещи</span>
            </div>
            <div className={styles.conditionChips}>
              {CONDITION_OPTIONS.map((opt) => {
                const active = filters.condition.includes(opt.value);
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    className={active ? styles.conditionChipActive : styles.conditionChip}
                    onClick={() => handleConditionToggle(opt.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Тип арендодателя */}
          <motion.div className={styles.filterGroup} variants={itemVariants}>
            <div className={styles.filterLabelRow}>
              <User size={16} />
              <span className={styles.filterLabel}>Тип владельца</span>
            </div>
            <div className={styles.segmentedControl}>
              {OWNER_TYPES.map((opt) => {
                const active = filters.ownerType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={active ? styles.segmentActive : styles.segment}
                    onClick={() => onChange({ ownerType: opt.value as any })}
                  >
                    <opt.icon size={14} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Доставка */}
          <motion.div className={styles.filterGroup} variants={itemVariants}>
            <div className={styles.filterLabelRow}>
              <Truck size={16} />
              <span className={styles.filterLabel}>Способ получения</span>
            </div>
            <div className={styles.segmentedControl}>
              {DELIVERY_TYPES.map((opt) => {
                const active = filters.deliveryType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={active ? styles.segmentActive : styles.segment}
                    onClick={() => onChange({ deliveryType: opt.value as any })}
                  >
                    <opt.icon size={14} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Дополнительно */}
          <motion.div className={styles.filterGroup} variants={itemVariants}>
            <div className={styles.filterLabelRow}>
              <Zap size={16} />
              <span className={styles.filterLabel}>Дополнительно</span>
            </div>
            <div className={styles.switchesGrid}>
              <label className={styles.fancyCheckbox}>
                <input
                  type="checkbox"
                  checked={filters.onlyAvailable}
                  onChange={(e) => onChange({ onlyAvailable: e.target.checked })}
                />
                <div className={styles.checkboxContent}>
                  <CalendarCheck size={18} />
                  <span>Доступно сегодня</span>
                  <div className={styles.checkMark}><CheckCircle2 size={16} /></div>
                </div>
              </label>

              <label className={styles.fancyCheckbox}>
                <input
                  type="checkbox"
                  checked={filters.hasDeposit === 'no'}
                  onChange={(e) => onChange({ hasDeposit: e.target.checked ? 'no' : 'all' })}
                />
                <div className={styles.checkboxContent}>
                  <ShieldCheck size={18} />
                  <span>Без залога</span>
                  <div className={styles.checkMark}><CheckCircle2 size={16} /></div>
                </div>
              </label>
            </div>
          </motion.div>
        </div>

        <motion.div className={styles.filtersFooter} variants={itemVariants}>
          <div className={styles.footerStats}>
            <span>Найдено: <strong>{resultsCount}</strong> {getAnnouncementsLabel(resultsCount)}</span>
          </div>
          <motion.button 
            type="button" 
            className={styles.primaryAction} 
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Search size={18} />
            <span>Применить фильтры</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.aside>
  );
}

function SlidersIcon() {
  return (
    <div className={styles.titleIcon}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="2" y1="14" x2="6" y2="14" />
        <line x1="10" y1="8" x2="14" y2="8" />
        <line x1="18" y1="16" x2="22" y2="16" />
      </svg>
    </div>
  );
}
