"use client";

import {
  signIn,
  signOut,
  useSession as useNextAuthSession,
} from "next-auth/react";

export type AuthResult = { ok: boolean; error: string | null };

interface RegisterApiResponse {
  success: boolean;
  user?: { id: string; phone: string; full_name: string | null; role: string };
  accessToken?: string;
  expiresIn?: number;
  error?: string;
}

export function useSession() {
  const { data: session, status } = useNextAuthSession();

  // ── LOGIN ────────────────────────────────────────────────────────────────
  const login = async (
    tel: string,
    password: string,
    rememberMe = false,
  ): Promise<AuthResult> => {
    try {
      const res = await signIn("credentials", {
        tel,
        password,
        rememberMe,
        redirect: false,
      });
      const error = res?.error ?? null;
      return { ok: !error, error };
    } catch (e) {
      const message = e instanceof Error ? e.message : "CredentialsSignin";
      return { ok: false, error: message };
    }
  };

  const signUp = async (
    name: string,
    tel: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, tel, password }),
      });

      const data: RegisterApiResponse = await res.json();
      console.log(data);
      if (!res.ok || !data.success) {
        return {
          ok: false,
          error: data.error ?? "Ошибка при регистрации. Попробуйте позже.",
        };
      }

      // Когда появится RTK Query, accessToken из data.accessToken
      // положить в redux store из jwt callback(get session)
      const autoLoginResult = await login(tel, password);

      if (!autoLoginResult.ok) {
        return {
          ok: false,
          error: "REGISTERED_BUT_LOGIN_FAILED",
        };
      }

      return autoLoginResult;
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Неизвестная ошибка регистрации";
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
    signUp,
    logout,
  };
}
