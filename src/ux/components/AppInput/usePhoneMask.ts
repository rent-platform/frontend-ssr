'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FocusEvent, KeyboardEvent } from 'react';
import {
  stripToPhoneDigits,
  formatPhoneDigits,
  countDigits,
  getCaretPositionForDigitCount,
  getNormalizedPhoneValue,
} from './phoneMask';

type UsePhoneMaskOptions = {
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  name?: string;
  isControlled: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

export function usePhoneMask({
  value,
  defaultValue,
  name,
  isControlled,
  onChange,
  onBlur,
  onKeyDown,
}: UsePhoneMaskOptions) {
  const [uncontrolledDigits, setUncontrolledDigits] = useState(() =>
    !isControlled ? stripToPhoneDigits(String(defaultValue ?? '')) : '',
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingCaretRef = useRef<number | null>(null);

  const digits = isControlled
    ? stripToPhoneDigits(String(value ?? ''))
    : uncontrolledDigits;

  const displayValue = formatPhoneDigits(digits);

  useEffect(() => {
    if (pendingCaretRef.current === null || !inputRef.current) return;

    const pos = pendingCaretRef.current;
    pendingCaretRef.current = null;

    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(pos, pos);
    });
  });

  const syncExternal = (nextDigits: string) => {
    onChange?.({
      target: { name, value: getNormalizedPhoneValue(nextDigits) },
      currentTarget: { name, value: getNormalizedPhoneValue(nextDigits) },
      type: 'change',
    } as ChangeEvent<HTMLInputElement>);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDigits = stripToPhoneDigits(event.target.value);
    const digitCountBeforeCaret = countDigits(
      event.target.value.slice(0, event.target.selectionStart ?? event.target.value.length),
    );
    const nextFormatted = formatPhoneDigits(nextDigits);

    if (!isControlled) {
      setUncontrolledDigits(nextDigits);
    }
    pendingCaretRef.current = getCaretPositionForDigitCount(nextFormatted, digitCountBeforeCaret);
    syncExternal(nextDigits);
  };

  const handleBackspace = (event: KeyboardEvent<HTMLInputElement>) => {
    const input = inputRef.current;
    if (!input) return;

    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? 0;
    const currentFormatted = formatPhoneDigits(digits);

    if (selectionStart !== selectionEnd) return;
    if (selectionStart <= 0) {
      event.preventDefault();
      return;
    }

    const charBefore = currentFormatted[selectionStart - 1];
    if (/\d/.test(charBefore ?? '')) return;

    event.preventDefault();

    const digitsBeforeChar = countDigits(currentFormatted.slice(0, selectionStart - 1));
    if (digitsBeforeChar <= 0) return;

    const nextDigits =
      digits.slice(0, digitsBeforeChar - 1) + digits.slice(digitsBeforeChar);
    const nextFormatted = formatPhoneDigits(nextDigits);

    if (!isControlled) {
      setUncontrolledDigits(nextDigits);
    }
    pendingCaretRef.current = getCaretPositionForDigitCount(nextFormatted, digitsBeforeChar - 1);
    syncExternal(nextDigits);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.({
      ...event,
      target: { ...event.target, name, value: getNormalizedPhoneValue(digits) },
      currentTarget: { ...event.currentTarget, name, value: getNormalizedPhoneValue(digits) },
    } as FocusEvent<HTMLInputElement>);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      handleBackspace(event);
    }
    onKeyDown?.(event);
  };

  return {
    inputRef,
    displayValue,
    handleChange,
    handleBlur,
    handleKeyDown,
  };
}
