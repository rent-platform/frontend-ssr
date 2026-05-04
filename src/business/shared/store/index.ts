import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import uiReducer from "./features/ui/uiSlice";
import { baseApi } from "../api/baseApi";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;

export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<RootDispatch>();
export { default as StoreProvider } from "./StoreProvider";


