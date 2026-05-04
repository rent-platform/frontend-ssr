"use client";

import { useCreateReviewMutation } from "../api";
import { getApiError } from "@/business/shared";
import { type ApiUiError } from "@/business/shared";
import type { CreateReviewRequest, ReviewDTO } from "../types";

export interface UseCreateReviewResult {
  createReview: (payload: CreateReviewRequest) => Promise<unknown>; // Запускает mutation создания отзыва.
  review: ReviewDTO | null; // Созданный отзыв из успешного ответа.
  isCreating: boolean; // Активно ли сейчас создание отзыва.
  isError: boolean; // Завершилась ли mutation ошибкой.
  createError: ApiUiError | null; // Нормализованная ошибка создания для UI.
  isSuccess: boolean; // Успешно ли завершилась mutation.
  reset: () => void; // Сбрасывает состояние mutation.
}

export function useCreateReview(): UseCreateReviewResult {
  const [
    createReviewMutation,
    { data, isLoading, isError, isSuccess, error, reset },
  ] = useCreateReviewMutation();

  return {
    createReview: (payload) => createReviewMutation(payload), // Передаём payload в RTK Query mutation.
    review: data ?? null, // Если ответа ещё нет, UI получает null.
    isCreating: isLoading, // Переименовываем isLoading в предметное состояние.
    isError, // Оставляем стандартный флаг ошибки.
    createError: getApiError(error), // Преобразуем сырой error в ApiUiError.
    isSuccess, // Флаг успешного создания.
    reset, // Даём UI возможность очистить mutation state.
  };
}




