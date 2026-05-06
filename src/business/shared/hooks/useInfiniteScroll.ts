"use client";
import { useCallback, useEffect, useRef } from "react"; // React hooks для ref, эффекта и мемоизации callback.

type Props = {
  // Параметры hook бесконечной прокрутки.
  hasNextPage: boolean; // Есть ли следующая страница данных.
  isFetching: boolean; // Выполняется ли сейчас запрос.
  fetchNextPage: () => void; // Функция загрузки следующей страницы.
  rootMargin?: string; // Отступ до sentinel-элемента для раннего срабатывания.
  threshold?: number; // Минимальная видимая доля sentinel-элемента.
};

// Hook, который возвращает ref для элемента-наблюдателя.
export const useInfiniteScroll = ({
  hasNextPage, // Флаг наличия следующей страницы.
  isFetching, // Флаг активного запроса.
  fetchNextPage, // Команда догрузки страницы.
  rootMargin = "100px", // Значение по умолчанию для ранней догрузки.
  threshold = 0.1, // Observer сработает, когда видно 10% элемента
}: Props) => {
  const observerRef = useRef<HTMLDivElement>(null); // ref для элемента-наблюдателя.
  const loadMoreHandler = useCallback(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage(); // Запускает загрузку следующей страницы.
    }
  }, [hasNextPage, isFetching, fetchNextPage]); // Обновляет callback при изменении условий догрузки.
  useEffect(() => {
    // Создаёт и очищает IntersectionObserver.
    const observer = new IntersectionObserver( // Наблюдатель за появлением элемента в viewport.
      (entries) => {
        // Callback observer получает список наблюдаемых элементов.
        if (entries.length > 0 && entries[0].isIntersecting) {
          // Проверяет, что элемент появился в зоне видимости.
          loadMoreHandler(); // При появлении элемента запускает обработчик догрузки.
        }
      },
      {
        root: null, // Наблюдение относительно viewport браузера.
        rootMargin, // Отступ, позволяющий начать загрузку заранее.
        threshold, // Доля видимости элемента для срабатывания.
      },
    );
    const currentObserverRef = observerRef.current; // Запоминает текущий DOM-элемент.
    // Проверяет, что элемент уже отрендерился.
    if (currentObserverRef) {
      observer.observe(currentObserverRef); // Начинает наблюдение за элементом.
    }
    return () => {
      // Проверяет, был ли элемент под наблюдением.
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef); // Снимает наблюдение с элемента.
      }
    };
  }, [loadMoreHandler, rootMargin, threshold]); // Пересоздаёт observer при изменении обработчика или настроек.
  return { observerRef }; // ref для элемента-наблюдателя.
};
