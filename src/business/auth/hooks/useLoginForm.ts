"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "./useSession";
import {
  getApiErrorMessage,
  loginFormSchema,
  ROUTE_PATHS,
  type LoginFormValues,
} from "../utils";

export function useLoginForm() {
  const router = useRouter();
  const { login } = useSession();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { rememberMe: false },
    shouldFocusError: false,
  });

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);
    const { ok, error, code, redirectTo } = await login(
      data.tel,
      data.password,
      data.rememberMe,
    );

    if (ok) {
      router.replace(redirectTo ?? ROUTE_PATHS.HOME);
      return;
    }

    if (error === "CredentialsSignin") {
      setApiError(
        code === "account_blocked"
          ? "Аккаунт заблокирован. Обратитесь в поддержку."
          : "Неверный телефон или пароль. Попробуйте снова.",
      );
      return;
    }

    setApiError(getApiErrorMessage(error));
  };

  return {
    register,
    isLoading,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    apiError,
  };
}



