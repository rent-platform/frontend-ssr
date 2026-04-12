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
    <nav className={styles.categoryRail} aria-label="Категории товаров">
      {categories.map((category) => {
        const visual = categoryVisualMap[category] ?? { emoji: '📦', hint: 'Аренда вещей' };
        const isActive = category === activeCategory;

        return (
          <button
            key={category}
            type="button"
            className={isActive ? styles.categoryCardActive : styles.categoryCard}
            onClick={() => onCategoryChange(isActive ? 'Все категории' : category)}
            aria-pressed={isActive}
          >
            <span className={styles.categoryEmoji} role="img" aria-hidden="true">
              {visual.emoji}
            </span>
            <span className={styles.categoryLabel}>{category}</span>
          </button>
        );
      })}
    </nav>
  );
}
