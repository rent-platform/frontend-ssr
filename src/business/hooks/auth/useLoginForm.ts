"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/business/hooks";
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/business/utils/authShecmas/authSchemas";
import ROUTE_PATHS from "@/business/utils/routes/routes";

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
    const { ok, error } = await login(data.tel, data.password, data.rememberMe);
    if (ok) {
      router.replace(ROUTE_PATHS.HOME); // TODO: idk if its should be like that
    } else {
      setApiError(
        error === "CredentialsSignin"
          ? "Неверный телефон или пароль. Попробуйте снова."
          : "Ошибка входа. Попробуйте позже.",
      );
    }
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
