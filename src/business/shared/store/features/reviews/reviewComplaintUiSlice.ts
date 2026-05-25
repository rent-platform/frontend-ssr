import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ComplaintTargetType } from "@/business/complaints/types";
import type {
  ReceivedFilter,
  ReviewsTab,
  ReviewSort,
  StarFilter,
} from "@/ux/features/Reviews/types";

export type ReviewRatingDraft = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReviewDraftState {
  dealId: string | null;
  rating: ReviewRatingDraft;
  text: string;
}

export interface ComplaintDraftState {
  targetType: ComplaintTargetType | null;
  targetId: string | null;
  reason: string;
  text: string;
}

export interface ReviewComplaintUiState {
  tab: ReviewsTab;
  receivedFilter: ReceivedFilter;
  starFilter: StarFilter;
  sort: ReviewSort;
  reviewDraft: ReviewDraftState;
  complaintDraft: ComplaintDraftState;
}

const initialReviewDraft: ReviewDraftState = {
  dealId: null,
  rating: 0,
  text: "",
};

const initialComplaintDraft: ComplaintDraftState = {
  targetType: null,
  targetId: null,
  reason: "",
  text: "",
};

const initialState: ReviewComplaintUiState = {
  tab: "received",
  receivedFilter: "all",
  starFilter: 0,
  sort: "newest",
  reviewDraft: initialReviewDraft,
  complaintDraft: initialComplaintDraft,
};

const reviewComplaintUiSlice = createSlice({
  name: "reviewComplaintUi",
  initialState,
  reducers: {
    setReviewsTab(state, action: PayloadAction<ReviewsTab>) {
      state.tab = action.payload;
    },
    setReviewsReceivedFilter(state, action: PayloadAction<ReceivedFilter>) {
      state.receivedFilter = action.payload;
    },
    setReviewsStarFilter(state, action: PayloadAction<StarFilter>) {
      state.starFilter = action.payload;
    },
    setReviewsSort(state, action: PayloadAction<ReviewSort>) {
      state.sort = action.payload;
    },
    patchReviewDraft(
      state,
      action: PayloadAction<Partial<ReviewDraftState>>,
    ) {
      state.reviewDraft = { ...state.reviewDraft, ...action.payload };
    },
    resetReviewDraft(state) {
      state.reviewDraft = initialReviewDraft;
    },
    patchComplaintDraft(
      state,
      action: PayloadAction<Partial<ComplaintDraftState>>,
    ) {
      state.complaintDraft = { ...state.complaintDraft, ...action.payload };
    },
    resetComplaintDraft(state) {
      state.complaintDraft = initialComplaintDraft;
    },
  },
});

export const {
  setReviewsTab,
  setReviewsReceivedFilter,
  setReviewsStarFilter,
  setReviewsSort,
  patchReviewDraft,
  resetReviewDraft,
  patchComplaintDraft,
  resetComplaintDraft,
} = reviewComplaintUiSlice.actions;

export default reviewComplaintUiSlice.reducer;
