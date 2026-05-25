import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type BookingStep =
  | "select_dates"
  | "confirm_request"
  | "payment"
  | "waiting_owner"
  | "active"
  | "completed";

export type BookingPriceBreakdown = {
  rentAmount: number;
  depositAmount: number;
  serviceFee: number;
  total: number;
};

export interface BookingState {
  itemId: string | null;
  startDate: string | null;
  endDate: string | null;
  rentalDays: number;
  priceBreakdown: BookingPriceBreakdown | null;
  currentDealId: string | null;
  step: BookingStep;
}

const initialState: BookingState = {
  itemId: null,
  startDate: null,
  endDate: null,
  rentalDays: 0,
  priceBreakdown: null,
  currentDealId: null,
  step: "select_dates",
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    startBookingForItem(state, action: PayloadAction<string>) {
      state.itemId = action.payload;
      state.step = "select_dates";
    },
    setBookingDates(
      state,
      action: PayloadAction<{
        startDate: string | null;
        endDate: string | null;
        rentalDays: number;
      }>,
    ) {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.rentalDays = action.payload.rentalDays;
    },
    setBookingPriceBreakdown(
      state,
      action: PayloadAction<BookingPriceBreakdown | null>,
    ) {
      state.priceBreakdown = action.payload;
    },
    setBookingDealId(state, action: PayloadAction<string | null>) {
      state.currentDealId = action.payload;
    },
    setBookingStep(state, action: PayloadAction<BookingStep>) {
      state.step = action.payload;
    },
    resetBooking() {
      return initialState;
    },
  },
});

export const {
  startBookingForItem,
  setBookingDates,
  setBookingPriceBreakdown,
  setBookingDealId,
  setBookingStep,
  resetBooking,
} = bookingSlice.actions;

export default bookingSlice.reducer;
