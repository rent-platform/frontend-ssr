import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CatalogFilterState } from "@/ux/features/Catalog";

export type CatalogViewMode = "grid" | "list";

export interface CatalogState {
  filters: CatalogFilterState;
  isFiltersOpen: boolean;
  selectedItemId: string | null;
  viewMode: CatalogViewMode;
  scrollRestoration: {
    lastScrollY: number;
  };
}

const initialFilters: CatalogFilterState = {
  search: "",
  city: "Новосибирск",
  category: "Все категории",
  minPrice: "",
  maxPrice: "",
  onlyAvailable: true,
  sortBy: "popular",
  quickFilter: null,
  hasDeposit: "all",
};

const initialState: CatalogState = {
  filters: initialFilters,
  isFiltersOpen: false,
  selectedItemId: null,
  viewMode: "grid",
  scrollRestoration: {
    lastScrollY: 0,
  },
};

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    setCatalogFilters(state, action: PayloadAction<CatalogFilterState>) {
      state.filters = action.payload;
    },
    patchCatalogFilters(
      state,
      action: PayloadAction<Partial<CatalogFilterState>>,
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetCatalogFilters(state) {
      state.filters = initialFilters;
    },
    openCatalogFilters(state) {
      state.isFiltersOpen = true;
    },
    closeCatalogFilters(state) {
      state.isFiltersOpen = false;
    },
    toggleCatalogFilters(state) {
      state.isFiltersOpen = !state.isFiltersOpen;
    },
    setSelectedCatalogItem(state, action: PayloadAction<string | null>) {
      state.selectedItemId = action.payload;
    },
    setCatalogViewMode(state, action: PayloadAction<CatalogViewMode>) {
      state.viewMode = action.payload;
    },
    saveCatalogScrollY(state, action: PayloadAction<number>) {
      state.scrollRestoration.lastScrollY = action.payload;
    },
  },
});

export const {
  setCatalogFilters,
  patchCatalogFilters,
  resetCatalogFilters,
  openCatalogFilters,
  closeCatalogFilters,
  toggleCatalogFilters,
  setSelectedCatalogItem,
  setCatalogViewMode,
  saveCatalogScrollY,
} = catalogSlice.actions;

export default catalogSlice.reducer;
