import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ItemStatus } from "@/business/ads/types";
import type { DealStatus } from "@/business/deals/types";

export type ProfileTab = "listings" | "deals" | "reviews";
export type SettingsTab =
  | "profile"
  | "security"
  | "notifications"
  | "payment"
  | "privacy";
export type ListingFilter = "all" | ItemStatus;
export type DealFilter = "all" | DealStatus;

export interface ProfileUiState {
  activeProfileTab: ProfileTab;
  listingFilter: ListingFilter;
  dealFilter: DealFilter;
  settingsTab: SettingsTab;
  editDraft: Record<string, unknown>;
}

const initialState: ProfileUiState = {
  activeProfileTab: "listings",
  listingFilter: "all",
  dealFilter: "all",
  settingsTab: "profile",
  editDraft: {},
};

const profileUiSlice = createSlice({
  name: "profileUi",
  initialState,
  reducers: {
    setActiveProfileTab(state, action: PayloadAction<ProfileTab>) {
      state.activeProfileTab = action.payload;
    },
    setProfileListingFilter(state, action: PayloadAction<ListingFilter>) {
      state.listingFilter = action.payload;
    },
    setProfileDealFilter(state, action: PayloadAction<DealFilter>) {
      state.dealFilter = action.payload;
    },
    setSettingsTab(state, action: PayloadAction<SettingsTab>) {
      state.settingsTab = action.payload;
    },
    patchProfileEditDraft(
      state,
      action: PayloadAction<Record<string, unknown>>,
    ) {
      state.editDraft = { ...state.editDraft, ...action.payload };
    },
    clearProfileEditDraft(state) {
      state.editDraft = {};
    },
  },
});

export const {
  setActiveProfileTab,
  setProfileListingFilter,
  setProfileDealFilter,
  setSettingsTab,
  patchProfileEditDraft,
  clearProfileEditDraft,
} = profileUiSlice.actions;

export default profileUiSlice.reducer;
