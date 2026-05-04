import { useState, useEffect } from "react";

export function useDebouncedValue<T>(value: T, delay: number): T {
  // Состояние для хранения отложенного значения
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Устанавливаем таймер, который обновит состояние через delay мс
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    // Функция очистки:
    // Удаляет предыдущий таймер, если значение изменилось быстрее, чем прошла задержка.
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // Эффект срабатывает при изменении значения или времени задержки

  return debounced;
}


