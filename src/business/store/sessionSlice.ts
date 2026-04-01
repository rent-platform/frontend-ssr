import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/business/api";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export interface SessionState {
  token: string | null;
  user: User | null;
}

// SSR-safe: читаем localStorage только на клиенте
function getInitialState(): SessionState {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }
  const token = localStorage.getItem(TOKEN_KEY);
  let user: User | null = null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    user = raw ? (JSON.parse(raw) as User) : null;
  } catch {
    user = null;
  }
  return { token, user };
}

const sessionSlice = createSlice({
  name: "session",
  initialState: getInitialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User | null }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    },
  },
});

export const { setCredentials, logout } = sessionSlice.actions;
export default sessionSlice.reducer;

