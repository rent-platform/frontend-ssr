import styles from '../Catalog.module.scss';

type CategoryRailProps = {
  categories: readonly string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

const categoryVisualMap: Record<string, string> = {
  'Все категории': '✨',
  'Электроника': '💻',
  'Фото и видео': '📷',
  'Инструменты': '🛠️',
  'Для дома': '🛋️',
  'Спорт и отдых': '🏄',
  'Детские товары': '🧸',
  'Мероприятия': '🎉',
};

export function CategoryRail({ categories, activeCategory, onCategoryChange }: CategoryRailProps) {
  return (
    <section className={styles.categoryRail}>
      {categories.map((category) => {
        const isActive = category === activeCategory;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={isActive ? styles.categoryCardActive : styles.categoryCard}
          >
            <span className={styles.categoryEmoji}>{categoryVisualMap[category] ?? '📦'}</span>
            <span>{category}</span>
          </button>
        );
      })}
    </section>
  );
}
