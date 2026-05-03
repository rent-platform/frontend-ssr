"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "../session/useSession";
import {
  getApiErrorMessage,
  loginFormSchema,
  ROUTE_PATHS,
  type LoginFormValues,
} from "@/business/utils";

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
    const { ok, error, redirectTo } = await login(
      data.tel,
      data.password,
      data.rememberMe,
    );

    if (ok) {
      router.replace(redirectTo ?? ROUTE_PATHS.HOME);
      return;
    }

    setApiError(
      error === "CredentialsSignin"
        ? "Неверный телефон или пароль. Попробуйте снова."
        : getApiErrorMessage(error),
    );
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
