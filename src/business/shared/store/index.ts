import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./features/ui/uiSlice";
import { baseApi } from "../api/baseApi";

export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof makeStore>;

export { default as StoreProvider } from "./StoreProvider";
