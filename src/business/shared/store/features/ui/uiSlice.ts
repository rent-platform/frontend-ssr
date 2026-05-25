import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "success" | "error" | "info";

export type UiModalType =
  | "auth"
  | "share"
  | "complaint"
  | "confirm"
  | null;

export type UiModalState = {
  type: UiModalType;
  payload: Record<string, unknown> | null;
};

export interface UiState {
  isMobileMenuOpen: boolean;
  toast: { message: string; type: ToastType } | null;
  modal: UiModalState;
  globalLoading: boolean;
}

const initialState: UiState = {
  isMobileMenuOpen: false,
  toast: null,
  modal: {
    type: null,
    payload: null,
  },
  globalLoading: false,
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
    openModal(state, action: PayloadAction<UiModalState>) {
      state.modal = action.payload;
    },
    closeModal(state) {
      state.modal = initialState.modal;
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
  },
});

export const {
  toggleMobileMenu,
  closeMobileMenu,
  showToast,
  hideToast,
  openModal,
  closeModal,
  setGlobalLoading,
} = uiSlice.actions;
export default uiSlice.reducer;
