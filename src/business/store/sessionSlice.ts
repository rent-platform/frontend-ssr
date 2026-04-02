import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SessionUser } from "@/business/types/api-dto";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export interface SessionState {
  token: string | null;
  user: SessionUser | null;
}

function getInitialState(): SessionState {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }
  const token = localStorage.getItem(TOKEN_KEY); //TODO: на куки
  let user: SessionUser | null = null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    user = raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    user = null;
  }
  return { token, user };
}

const sessionSlice = createSlice({
  name: "session",
  initialState: getInitialState,
  selectors: {
    getToken: (state) => state.token,
    getUser: (state) => state.user,
  },
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: SessionUser | null }>,
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
export { sessionSlice };
export default sessionSlice.reducer;
