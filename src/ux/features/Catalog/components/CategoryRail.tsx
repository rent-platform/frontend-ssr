import { motion } from 'framer-motion';
import styles from '../Catalog.module.scss';

type CategoryRailProps = {
  categories: readonly string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

const categoryVisualMap: Record<string, { emoji: string; hint: string }> = {
  'Все категории': { emoji: '✨', hint: 'Техника, дом и отдых' },
  'Электроника': { emoji: '📱', hint: 'Ноутбуки и гаджеты' },
  'Фото и видео': { emoji: '📷', hint: 'Камеры и свет' },
  'Инструменты': { emoji: '🛠️', hint: 'Для ремонта и монтажа' },
  'Для дома': { emoji: '🛋️', hint: 'Уборка и интерьер' },
  'Спорт и отдых': { emoji: '🏄', hint: 'Путешествия и досуг' },
  'Детские товары': { emoji: '🧸', hint: 'Коляски и аксессуары' },
  'Мероприятия': { emoji: '🎉', hint: 'Проекторы и декор' },
};

export function CategoryRail({ categories, activeCategory, onCategoryChange }: CategoryRailProps) {
  return (
    <section className={styles.categoryRail} aria-label="Популярные категории">
      {categories.map((category, index) => {
        const visual = categoryVisualMap[category] ?? { emoji: '📦', hint: 'Аренда вещей' };
        const isActive = category === activeCategory;

        return (
          <motion.button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={isActive ? styles.categoryCardActive : styles.categoryCard}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div>
              <span className={styles.categoryLabel}>{category}</span>
              <span className={styles.categoryHint}>{visual.hint}</span>
            </div>
            <motion.span
              className={styles.categoryEmoji}
              animate={{ rotate: isActive ? [0, -10, 10, 0] : 0 }}
              transition={{ duration: 0.5 }}
            >
              {visual.emoji}
            </motion.span>
          </motion.button>
        );
      })}
    </section>
  );
}
