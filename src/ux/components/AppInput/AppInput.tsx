'use client';

import { useEffect, useRef, useState, forwardRef } from 'react';
import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  MutableRefObject,
  Ref,
} from 'react';
import clsx from 'clsx';
import { AlertCircle, Eye, EyeOff, Lock, UserRound, Phone } from 'lucide-react';
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

function stripToPhoneDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 10);
}

function formatPhoneDigits(value: string) {
  const digits = stripToPhoneDigits(value);

  if (!digits) return '';

  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 8);
  const part4 = digits.slice(8, 10);

  let formatted = `(${part1}`;

  if (digits.length >= 3) {
    formatted += ')';
  }

  if (part2) {
    formatted += ` ${part2}`;
  }

  if (part3) {
    formatted += `-${part3}`;
  }

  if (part4) {
    formatted += `-${part4}`;
  }

  return formatted;
}

function countDigits(value: string) {
  return (value.match(/\d/g) ?? []).length;
}

function getCaretPositionForDigitCount(formattedValue: string, digitCount: number) {
  if (digitCount <= 0) return 0;

  let seenDigits = 0;

  for (let index = 0; index < formattedValue.length; index += 1) {
    if (/\d/.test(formattedValue[index])) {
      seenDigits += 1;
      if (seenDigits === digitCount) {
        return index + 1;
      }
    }
  }

  return formattedValue.length;
}

function getNormalizedPhoneValue(digits: string) {
  return digits ? `+7${digits}` : '';
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
    const [uncontrolledPhoneDigits, setUncontrolledPhoneDigits] = useState(() =>
      type === 'tel' && value === undefined ? stripToPhoneDigits(String(defaultValue ?? '')) : '',
    );

    const inputRef = useRef<HTMLInputElement | null>(null);
    const pendingCaretPositionRef = useRef<number | null>(null);

    const isPassword = type === 'password';
    const isPhone = type === 'tel';
    const isControlled = value !== undefined;
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type === 'name' ? 'text' : type;
    const hasLeft = LEFT_ICON_TYPES.has(type);
    const phoneDigits = isPhone
      ? isControlled
        ? stripToPhoneDigits(String(value ?? ''))
        : uncontrolledPhoneDigits
      : '';
    const isFloatingLabelActive =
      isPassword &&
      (isFocused ||
        (isControlled ? Boolean(String(value ?? '')) : Boolean(uncontrolledPasswordValue)));
    const phoneDisplayValue = isPhone ? formatPhoneDigits(phoneDigits) : undefined;

    useEffect(() => {
      if (pendingCaretPositionRef.current === null || !inputRef.current) return;

      const caretPosition = pendingCaretPositionRef.current;
      pendingCaretPositionRef.current = null;

      requestAnimationFrame(() => {
        inputRef.current?.setSelectionRange(caretPosition, caretPosition);
      });
    });

    const setMergedRef = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (node) assignRef(ref, node);
    };

    const syncExternalPhoneValue = (digits: string) => {
      onChange?.({
        target: { name: props.name, value: getNormalizedPhoneValue(digits) },
        currentTarget: { name: props.name, value: getNormalizedPhoneValue(digits) },
        type: 'change',
      } as ChangeEvent<HTMLInputElement>);
    };

    const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
      const nextDigits = stripToPhoneDigits(event.target.value);
      const digitCountBeforeCaret = countDigits(
        event.target.value.slice(0, event.target.selectionStart ?? event.target.value.length),
      );
      const nextFormatted = formatPhoneDigits(nextDigits);

      if (!isControlled) {
        setUncontrolledPhoneDigits(nextDigits);
      }
      pendingCaretPositionRef.current = getCaretPositionForDigitCount(nextFormatted, digitCountBeforeCaret);
      syncExternalPhoneValue(nextDigits);
    };

    const handlePhoneBackspace = (event: KeyboardEvent<HTMLInputElement>) => {
      const input = inputRef.current;
      if (!input) return;

      const selectionStart = input.selectionStart ?? 0;
      const selectionEnd = input.selectionEnd ?? 0;
      const currentFormattedValue = formatPhoneDigits(phoneDigits);

      if (selectionStart !== selectionEnd) return;
      if (selectionStart <= 0) {
        event.preventDefault();
        return;
      }

      const characterBeforeCaret = currentFormattedValue[selectionStart - 1];
      if (/\d/.test(characterBeforeCaret ?? '')) return;

      event.preventDefault();

      const digitsBeforeFormattingCharacter = countDigits(
        currentFormattedValue.slice(0, selectionStart - 1),
      );
      if (digitsBeforeFormattingCharacter <= 0) return;

      const nextDigits =
        phoneDigits.slice(0, digitsBeforeFormattingCharacter - 1) +
        phoneDigits.slice(digitsBeforeFormattingCharacter);
      const nextFormatted = formatPhoneDigits(nextDigits);

      if (!isControlled) {
        setUncontrolledPhoneDigits(nextDigits);
      }
      pendingCaretPositionRef.current = getCaretPositionForDigitCount(
        nextFormatted,
        digitsBeforeFormattingCharacter - 1,
      );
      syncExternalPhoneValue(nextDigits);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (isPhone) {
        handlePhoneChange(event);
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
        onBlur?.({
          ...event,
          target: { ...event.target, name: props.name, value: getNormalizedPhoneValue(phoneDigits) },
          currentTarget: { ...event.currentTarget, name: props.name, value: getNormalizedPhoneValue(phoneDigits) },
        } as FocusEvent<HTMLInputElement>);
        return;
      }

      onBlur?.(event);
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (isPhone && event.key === 'Backspace') {
        handlePhoneBackspace(event);
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
            value={isPhone ? phoneDisplayValue : value}
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
