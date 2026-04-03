"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/business/api";
import { useSession } from "./useSession";
import {
  loginSchema,
  type LoginFormValues,
} from "@/business/utils/authShecmas/authSchemas";
import { ROUTE_PATHS } from "@/business/utils/routes/routes";
export function useLoginForm() {
  const router = useRouter();
  const { saveCredentials } = useSession();
  const [login, { isLoading }] = useLoginMutation();
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
    try {
      const { accessToken, user } = await login(data).unwrap();
      saveCredentials({ token: accessToken, user });
      router.replace(ROUTE_PATHS.HOME);
    } catch {
      setApiError("Неверный телефон или пароль. Попробуйте снова.");
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting: isSubmitting || isLoading,
    apiError,
  };
}
