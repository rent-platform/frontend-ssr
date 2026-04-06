"use client";

import {
  signIn,
  signOut,
  useSession as useNextAuthSession,
} from "next-auth/react";

export type LoginResult = { ok: boolean; error: string | null };

export function useSession() {
  const { data: session, status } = useNextAuthSession();

  const login = async (tel: string, password: string): Promise<LoginResult> => {
    try {
      const res = await signIn("credentials", {
        tel,
        password,
        redirect: false,
      });
      const error = res?.error ?? null;
      return { ok: !error, error };
    } catch (e) {
      const message = e instanceof Error ? e.message : "CredentialsSignin";
      return { ok: false, error: message };
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  return {
    user: session?.user ?? null,
    isAuthenticated: status === "authenticated", //куки валидны нет
    isLoading: status === "loading",
    login,
    logout,
  };
}
