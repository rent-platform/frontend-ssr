'use client';

import { useAppSelector, useAppDispatch, getToken, getUser } from "@/business/store";
import { logout, setCredentials } from "@/business/store/sessionSlice";
import type { SessionUser } from "@/business/types/api-dto";

export function useSession() {
  const dispatch = useAppDispatch();
  const token = useAppSelector(getToken);
  const user = useAppSelector(getUser);
  const isAuthenticated = Boolean(token);

  const signOut = () => dispatch(logout());
  const saveCredentials = (payload: { token: string; user: SessionUser | null }) =>
    dispatch(setCredentials(payload));

  return { user, token, isAuthenticated, signOut, saveCredentials };
}

