export { CatalogExperience } from './CatalogExperience';
export type { CatalogExperienceProps } from './CatalogExperience';
export { SearchResultsPage } from './SearchResultsPage';

export { CatalogCard } from './components/cards/CatalogCard';
export { CatalogHeader, BrandIcon } from './components/layout/CatalogHeader';
export { CatalogFooter } from './components/layout/CatalogFooter';
export { CatalogSearchBar } from './components/filters/CatalogSearchBar';
export { CatalogToolbar } from './components/filters/CatalogToolbar';
export { CategoryRail } from './components/filters/CategoryRail';
export { ProductDetail } from './components/detail/ProductDetail';

export type { CatalogUiItem, CatalogFilterState, CatalogSortKey } from './types';
export { mockCatalogItems } from './mockCatalogItems';
export {
  CATEGORY_OPTIONS,
  INITIAL_FILTERS,
  applyCatalogFilters,
} from './utils';
export { mapCardVMtoUiItem, mapCardVMsToUiItems } from './mappers';
