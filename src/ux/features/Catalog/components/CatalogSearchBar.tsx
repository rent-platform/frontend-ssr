import { Search, SlidersHorizontal } from "lucide-react";
import styles from "./CatalogSearchBar.module.scss";

type CatalogSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onToggleFilters: () => void;
  mobileFiltersOpen: boolean;
};

export function CatalogSearchBar({
  value,
  onChange,
  onToggleFilters,
  mobileFiltersOpen,
}: CatalogSearchBarProps) {
  return (
    <div className={styles.searchBar}>
      <div className={styles.inputWrap}>
        <Search size={18} />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Поиск по названию, категории или назначению"
          aria-label="Поиск по каталогу"
          className={styles.input}
        />
      </div>

      <button
        type="button"
        className={styles.filterTrigger}
        onClick={onToggleFilters}
        aria-expanded={mobileFiltersOpen}
      >
        <SlidersHorizontal size={18} />
        Фильтры
      </button>
    </div>
  );
}
