import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isMobileMenuOpen: boolean;
  toast: { message: string; type: "success" | "error" | "info" } | null;
}

const initialState: UiState = {
  isMobileMenuOpen: false,
  toast: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu(state) {
      state.isMobileMenuOpen = false;
    },
    showToast(state, action: PayloadAction<UiState["toast"]>) {
      state.toast = action.payload;
    },
    hideToast(state) {
      state.toast = null;
    },
  },
});

export const { toggleMobileMenu, closeMobileMenu, showToast, hideToast } =
  uiSlice.actions;
export default uiSlice.reducer;
