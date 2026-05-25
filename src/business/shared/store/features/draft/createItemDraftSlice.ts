import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CreateListingFormData } from "@/ux/features/CreateListing/types";

export type CreateListingStep = "photos" | "info" | "pricing" | "review";

export interface CreateListingDraftState {
  step: CreateListingStep;
  form: CreateListingFormData;
  dirty: boolean;
  lastSavedAt: string | null;
}

const initialForm: CreateListingFormData = {
  title: "",
  category: "",
  categoryId: "",
  condition: "good",
  description: "",
  images: [],
  pricePerDay: "",
  pricePerHour: "",
  depositAmount: "",
  noDeposit: false,
  pickupLocation: "",
};

const initialState: CreateListingDraftState = {
  step: "photos",
  form: initialForm,
  dirty: false,
  lastSavedAt: null,
};

const createItemDraftSlice = createSlice({
  name: "createListingDraft",
  initialState,
  reducers: {
    setCreateListingStep(state, action: PayloadAction<CreateListingStep>) {
      state.step = action.payload;
    },
    patchCreateListingDraft(
      state,
      action: PayloadAction<Partial<CreateListingFormData>>,
    ) {
      state.form = { ...state.form, ...action.payload };
      state.dirty = true;
    },
    replaceCreateListingDraft(
      state,
      action: PayloadAction<CreateListingFormData>,
    ) {
      state.form = action.payload;
      state.dirty = true;
    },
    markCreateListingDraftSaved(state, action: PayloadAction<string>) {
      state.dirty = false;
      state.lastSavedAt = action.payload;
    },
    resetCreateListingDraft() {
      return initialState;
    },
  },
});

export const {
  setCreateListingStep,
  patchCreateListingDraft,
  replaceCreateListingDraft,
  markCreateListingDraftSaved,
  resetCreateListingDraft,
} = createItemDraftSlice.actions;

export default createItemDraftSlice.reducer;
