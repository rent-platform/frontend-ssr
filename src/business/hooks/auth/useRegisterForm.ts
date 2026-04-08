"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "@/business/hooks";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/business/utils/authShecmas/authSchemas";
import ROUTE_PATHS from "@/business/utils/routes/routes";

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

    const { ok, error } = await signUp(data.name, data.tel, data.password);
    console.log(ok, error);
    if (ok) {
      router.replace(ROUTE_PATHS.HOME);
    } else {
      setApiError(
        error === "REGISTERED_BUT_LOGIN_FAILED"
          ? "Аккаунт создан, но войти не удалось. Попробуйте войти вручную."
          : (error ?? "Ошибка регистрации. Попробуйте позже."),
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
