"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "./useSession";
import { mockRegisterUser } from "@/business/mocks/auth/mockAuthService";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/business/utils/authShecmas/authSchemas";
import ROUTE_PATHS from "@/business/utils/routes/routes";

export function useRegisterForm() {
  const router = useRouter();
  const { login } = useSession();
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

    const registerResult = await mockRegisterUser({
      name: data.name,
      tel: data.tel,
      password: data.password,
    });

    if (!registerResult.success) {
      setApiError(registerResult.error);
      return;
    }

    const { ok, error } = await login(data.tel, data.password);

    if (ok) {
      router.replace(ROUTE_PATHS.HOME);
    } else {
      setApiError(
        error === "CredentialsSignin"
          ? "Аккаунт создан, но войти не удалось. Попробуйте войти вручную."
          : "Ошибка при входе. Попробуйте позже.",
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
    watch,
  };
}
