'use client';

import { useState, forwardRef } from 'react';
import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  MutableRefObject,
  Ref,
} from 'react';
import clsx from 'clsx';
import { AlertCircle, Eye, EyeOff, Lock, UserRound, Phone } from 'lucide-react';
import { usePhoneMask } from './usePhoneMask';
import styles from './AppInput.module.scss';

export interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  id: string;
}

function renderLeftIcon(type: string) {
  if (type === 'password') return <Lock size={16} />;
  if (type === 'tel') return <Phone size={16} />;
  if (type === 'name') return <UserRound size={16} />;
  return null;
}

const LEFT_ICON_TYPES = new Set(['password', 'tel', 'name']);

function assignRef<T>(ref: Ref<T> | undefined, value: T) {
  if (!ref) return;
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  (ref as MutableRefObject<T>).current = value;
}

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      label,
      error,
      id,
      type = 'text',
      className = '',
      onChange,
      onBlur,
      onFocus,
      onKeyDown,
      value,
      defaultValue,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [uncontrolledPasswordValue, setUncontrolledPasswordValue] = useState(() =>
      type === 'password' && value === undefined ? String(defaultValue ?? '') : '',
    );

    const isPassword = type === 'password';
    const isPhone = type === 'tel';
    const isControlled = value !== undefined;
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type === 'name' ? 'text' : type;
    const hasLeft = LEFT_ICON_TYPES.has(type);

    const phoneMask = usePhoneMask({
      value,
      defaultValue,
      name: props.name,
      isControlled,
      onChange,
      onBlur,
      onKeyDown,
    });

    const isFloatingLabelActive =
      isPassword &&
      (isFocused ||
        (isControlled ? Boolean(String(value ?? '')) : Boolean(uncontrolledPasswordValue)));

    const setMergedRef = (node: HTMLInputElement | null) => {
      if (isPhone) {
        phoneMask.inputRef.current = node;
      }
      if (node) assignRef(ref, node);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (isPhone) {
        phoneMask.handleChange(event);
        return;
      }

      if (isPassword && !isControlled) {
        setUncontrolledPasswordValue(event.target.value);
      }

      onChange?.(event);
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);

      if (isPhone) {
        phoneMask.handleBlur(event);
        return;
      }

      onBlur?.(event);
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (isPhone) {
        phoneMask.handleKeyDown(event);
        return;
      }

      onKeyDown?.(event);
    };

    return (
      <div className={styles.field}>
        {label && !isPassword && (
          <label className={styles.label} htmlFor={id}>
            {label}
          </label>
        )}

        <div
          className={clsx(
            styles.inputWrapper,
            isPassword && styles.passwordWrapper,
            isFloatingLabelActive && styles.floatingActive,
          )}
        >
          {hasLeft && (
            <span className={styles.leftIcon} aria-hidden="true">
              {renderLeftIcon(type)}
            </span>
          )}

          {isPhone && (
            <span className={styles.phonePrefix} aria-hidden="true">
              +7
            </span>
          )}

          <input
            ref={setMergedRef}
            id={id}
            type={resolvedType}
            className={clsx(
              styles.input,
              hasLeft && styles.withLeft,
              isPassword && styles.withRight,
              isPhone && styles.withPhonePrefix,
              error && styles.inputError,
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            value={isPhone ? phoneMask.displayValue : value}
            defaultValue={isPhone ? undefined : defaultValue}
            placeholder={isPassword ? ' ' : isPhone ? placeholder ?? '(___) ___-__-__' : placeholder}
            {...props}
            inputMode={isPhone ? 'numeric' : props.inputMode}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
          />

          {isPassword && label && (
            <label className={styles.floatingLabel} htmlFor={id}>
              {label}
            </label>
          )}

          {isPassword && (
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
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

AppInput.displayName = 'AppInput';
export default AppInput;
