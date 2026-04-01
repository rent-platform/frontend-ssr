'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMutation } from "@/business/api";
import { useSession } from "./useSession";
import { registerSchema, type RegisterFormValues } from "@/business/utils/authSchemas";
import { ROUTE_PATHS } from "@/business/utils/routes";

/** Инкапсулирует всю логику формы регистрации.
 *  UI-компонент не знает про RTK Query, Redux или схему валидации. */
export function useRegisterForm() {
  const router = useRouter();
  const { saveCredentials } = useSession();
  const [register_api, { isLoading }] = useRegisterMutation();
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
    try {
      const { accessToken, user } = await register_api({
        name: data.name,
        tel: data.tel,
        password: data.password,
      }).unwrap();
      saveCredentials({ token: accessToken, user });
      router.replace(ROUTE_PATHS.HOME);
    } catch {
      setApiError("Пользователь с таким телефоном уже существует.");
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting: isSubmitting || isLoading,
    apiError,
    watch,
  };
}

