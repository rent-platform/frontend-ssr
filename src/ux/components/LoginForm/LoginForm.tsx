'use client';

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import AppInput from "@/ux/components/AppInput";
import { useLoginForm } from "@/business/hooks";
import { ROUTE_PATHS } from "@/business/utils/routes";
import styles from "@/ux/layouts/AuthLayout/AuthForm.module.scss";

/** "Глупый" UI-компонент — вся логика делегирована в useLoginForm() */
export const LoginForm = () => {
  const { register, handleSubmit, onSubmit, errors, isSubmitting, apiError } =
    useLoginForm();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Вход</h1>
        <p className={styles.subtitle}>Войдите в свой аккаунт</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <AppInput
          id="tel"
          label="Телефон"
          type="tel"
          autoComplete="tel"
          placeholder="+7 (___) ___-__-__"
          error={errors.tel?.message}
          {...register("tel")}
        />

        <AppInput
          id="password"
          label="Пароль"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        {apiError && (
          <div className={styles.apiError}>
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}

        <div className={styles.rememberMe}>
          <input
            type="checkbox"
            className={styles.checkBox}
            disabled={isSubmitting}
            id="rememberMe"
          />
          <label htmlFor="rememberMe">Запомнить пароль</label>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting && <span className={styles.spinner} />}
          {isSubmitting ? "Входим…" : "Войти"}
        </button>
      </form>

      <p className={styles.footer}>
        Нет аккаунта?{" "}
        <Link href={ROUTE_PATHS.REGISTER} className={styles.link}>
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
};

