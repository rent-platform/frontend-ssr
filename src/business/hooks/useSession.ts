'use client';

import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/business/store";
import { logout, setCredentials } from "@/business/store/sessionSlice";
import type { User } from "@/business/api";

/** Хук-абстракция над sessionSlice.
 *  UI-разработчик работает только с этим хуком — без прямого доступа к Redux. */
export function useSession() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.session.token);
  const user = useSelector((state: RootState) => state.session.user);
  const isAuthenticated = Boolean(token);

  const signOut = () => dispatch(logout());
  const saveCredentials = (payload: { token: string; user: User | null }) =>
    dispatch(setCredentials(payload));

  return { user, token, isAuthenticated, signOut, saveCredentials };
}

