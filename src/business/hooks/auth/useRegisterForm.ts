"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "../session/useSession";
import {
  getApiErrorMessage,
  registerSchema,
  ROUTE_PATHS,
  type RegisterFormValues,
} from "@/business/utils";

export function useRegisterForm() {
  const router = useRouter();
  const { signUp } = useSession();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    shouldFocusError: false,
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError(null);
    const { ok, error, redirectTo } = await signUp(
      data.name,
      data.tel,
      data.password,
    );

    if (ok) {
      router.replace(redirectTo ?? ROUTE_PATHS.HOME);
      return;
    }

    setApiError(
      error === "REGISTERED_BUT_LOGIN_FAILED"
        ? "Аккаунт создан, но войти не удалось. Попробуйте войти вручную."
        : getApiErrorMessage(error),
    );
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    apiError,
    watch,
  };
}
