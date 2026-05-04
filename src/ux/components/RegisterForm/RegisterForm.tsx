"use client";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import AppInput from "@/ux/components/AppInput";
import { useRegisterForm } from "@/business/hooks";
import { ROUTES } from "@/ux/utils";
import styles from "@/ux/layouts/AuthLayout/AuthForm.module.scss";

export const RegisterForm = () => {
  const { register, handleSubmit, onSubmit, errors, isSubmitting, apiError } =
    useRegisterForm();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Регистрация</h1>
        <p className={styles.subtitle}>Создайте аккаунт, чтобы начать</p>
      </div>

      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <AppInput
          id="reg-name"
          label="Имя"
          type="name"
          autoComplete="name"
          placeholder="Иван Иванов"
          error={errors.name?.message}
          {...register("name")}
        />

        <AppInput
          id="tel"
          label="Телефон"
          type="tel"
          autoComplete="tel"
          placeholder="(___) ___-__-__"
          error={errors.tel?.message}
          {...register("tel")}
        />

        <AppInput
          id="reg-password"
          label="Пароль"
          type="password"
          autoComplete="new-password"
          placeholder="Минимум 6 символов"
          error={errors.password?.message}
          {...register("password")}
        />

        <AppInput
          id="reg-confirm"
          label="Подтверждение пароля"
          type="password"
          autoComplete="new-password"
          placeholder="Повторите пароль"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {apiError && (
          <div className={styles.apiError}>
            <AlertCircle size={16} />
            {apiError}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting && <span className={styles.spinner} />}
          {isSubmitting ? "Регистрируем…" : "Зарегистрироваться"}
        </button>
      </form>

      <p className={styles.footer}>
        Уже есть аккаунт?{" "}
        <Link href={ROUTES.login} className={styles.link}>
          Войти
        </Link>
      </p>
    </div>
  );
};
