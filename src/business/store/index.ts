import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/business/api";
import { useDispatch, useSelector } from "react-redux";
import sessionReducer, { sessionSlice } from "./sessionSlice";

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;

export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<RootDispatch>();


export const { getToken, getUser } = sessionSlice.getSelectors<RootState>(
  (state) => state.session,
);

