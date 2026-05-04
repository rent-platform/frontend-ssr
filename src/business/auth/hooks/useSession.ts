"use client";

import {
  getSession,
  signIn,
  signOut,
  useSession as useNextAuthSession,
} from "next-auth/react";
import { getDefaultRouteForRole } from "../utils";
import { registerApi } from "../api";

export type AuthResult = {
  ok: boolean;
  error: string | null;
  redirectTo?: string;
};

export function useSession() {
  const { data: session, status } = useNextAuthSession();

  // ── LOGIN ────────────────────────────────────────────────────────────────
  const login = async (
    tel: string,
    password: string,
    rememberMe = false,
  ): Promise<AuthResult> => {
    try {
      // Credentials sign-in delegates validation to Auth.js authorize().
      // redirect: false lets the form handle errors and route selection.
      const res = await signIn("credentials", {
        tel,
        password,
        rememberMe,
        redirect: false,
      });
      const error = res?.error ?? null;

      if (error) {
        return { ok: false, error };
      }

      // Read the freshly issued session to redirect users by their stored role.
      const session = await getSession();
      return {
        ok: true,
        error: null,
        redirectTo: getDefaultRouteForRole(session?.user?.role),
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "MyCredentialsSignin";
      return { ok: false, error: message };
    }
  };

  const signUp = async (
    nickname: string,
    tel: string,
    password: string,
    confirmPassword: string,
  ): Promise<AuthResult> => {
    try {
      await registerApi({
        phone: tel,
        password,
        confirmPassword,
        nickname,
      });

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



