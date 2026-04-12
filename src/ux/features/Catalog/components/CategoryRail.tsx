import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  Smartphone, 
  Camera, 
  Wrench, 
  Home, 
  Bike, 
  Baby, 
  PartyPopper,
  PackageSearch
} from 'lucide-react';
import styles from '../Catalog.module.scss';

type CategoryRailProps = {
  categories: readonly string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

const categoryVisualMap: Record<string, { icon: any; hint: string }> = {
  'Все категории': { icon: LayoutGrid, hint: 'Техника, дом и отдых' },
  'Электроника': { icon: Smartphone, hint: 'Ноутбуки и гаджеты' },
  'Фото и видео': { icon: Camera, hint: 'Камеры и свет' },
  'Инструменты': { icon: Wrench, hint: 'Для ремонта и монтажа' },
  'Для дома': { icon: Home, hint: 'Уборка и интерьер' },
  'Спорт и отдых': { icon: Bike, hint: 'Путешествия и досуг' },
  'Детские товары': { icon: Baby, hint: 'Коляски и аксессуары' },
  'Мероприятия': { icon: PartyPopper, hint: 'Проекторы и декор' },
};

export function CategoryRail({ categories, activeCategory, onCategoryChange }: CategoryRailProps) {
  return (
    <nav className={styles.categoryRail} aria-label="Категории товаров">
      <div className={styles.categoryRailInner}>
        {categories.map((category) => {
          const visual = categoryVisualMap[category] ?? { icon: PackageSearch, hint: 'Аренда вещей' };
          const isActive = category === activeCategory;
          const Icon = visual.icon;

          return (
            <motion.button
              key={category}
              type="button"
              className={isActive ? styles.categoryCardActive : styles.categoryCard}
              onClick={() => onCategoryChange(isActive ? 'Все категории' : category)}
              aria-pressed={isActive}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className={styles.categoryEmojiWrap}>
                <Icon 
                  size={20} 
                  className={styles.categoryIcon} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <motion.div 
                    className={styles.categoryGlow}
                    layoutId="categoryGlow"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </div>
              
              <span className={styles.categoryLabel}>{category}</span>
              
              {isActive && (
                <motion.div 
                  className={styles.categoryActiveIndicator}
                  layoutId="activeCategoryUnderline"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
