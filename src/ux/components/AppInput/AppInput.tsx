'use client';

import { useState, forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import clsx from "clsx";
import { AlertCircle, Eye, EyeOff, Lock, UserRound, Phone } from "lucide-react";
import styles from "./AppInput.module.scss";

export interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
}

function renderLeftIcon(type: string) {
  if (type === "password") return <Lock size={16} />;
  if (type === "tel")      return <Phone size={16} />;
  if (type === "name")     return <UserRound size={16} />;
  return null;
}

const LEFT_ICON_TYPES = new Set(["password", "tel", "name"]);

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, error, id, type = "text", className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword   = type === "password";
    const resolvedType = isPassword
      ? showPassword ? "text" : "password"
      : type === "name" ? "text" : type;

    const hasLeft = LEFT_ICON_TYPES.has(type);

    return (
      <div className={styles.field}>
        {label && (
          <label className={styles.label} htmlFor={id}>
            {label}
          </label>
        )}

        <div className={styles.inputWrapper}>
          {hasLeft && (
            <span className={styles.leftIcon} aria-hidden="true">
              {renderLeftIcon(type)}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={resolvedType}
            className={clsx(
              styles.input,
              hasLeft    && styles.withLeft,
              isPassword && styles.withRight,
              error      && styles.inputError,
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {error && (
          <span id={`${id}-error`} className={styles.error} role="alert">
            <AlertCircle size={15} aria-hidden="true" />
            {error}
          </span>
        )}
      </div>
    );
  },
);

AppInput.displayName = "AppInput";
export default AppInput;



