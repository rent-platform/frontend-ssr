"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "./useSession";
import {
  loginSchema,
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
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    shouldFocusError: false,
  });

  const onSubmit = async (data: LoginFormValues) => {
    setApiError(null);

    const { ok, error } = await login(data.tel, data.password);

    if (ok) {
      router.replace(ROUTE_PATHS.HOME);
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
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    apiError,
  };
}
