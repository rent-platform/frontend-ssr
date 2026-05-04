/**
 * Phone mask utilities for Russian +7 format.
 * Handles digit extraction, formatting, and caret positioning.
 */

export function stripToPhoneDigits(value: string) {
  return value.replace(/\D/g, '').slice(0, 10);
}

export function formatPhoneDigits(value: string) {
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

export function countDigits(value: string) {
  return (value.match(/\d/g) ?? []).length;
}

export function getCaretPositionForDigitCount(formattedValue: string, digitCount: number) {
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

export function getNormalizedPhoneValue(digits: string) {
  return digits ? `+7${digits}` : '';
}
