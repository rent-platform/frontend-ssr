import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import uiReducer from "./features/ui/uiSlice";
import catalogReducer from "./features/catalog/catalogSlice";
import createListingDraftReducer from "./features/draft/createItemDraftSlice";
import bookingReducer from "./features/booking/bookingSlice";
import chatUiReducer from "./features/chat/chatUiSlice";
import profileUiReducer from "./features/profile/profileUiSlice";
import reviewComplaintUiReducer from "./features/reviews/reviewComplaintUiSlice";
import { baseApi } from "../api/baseApi";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    catalog: catalogReducer,
    createListingDraft: createListingDraftReducer,
    booking: bookingReducer,
    chatUi: chatUiReducer,
    profileUi: profileUiReducer,
    reviewComplaintUi: reviewComplaintUiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<RootDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export { default as StoreProvider } from "./StoreProvider";
