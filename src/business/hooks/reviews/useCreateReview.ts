"use client";

import { useCreateReviewMutation } from "@/business/api";
import type {
  CreateReviewRequest,
  Review,
} from "@/business/types/dto/reviews.dto";

export interface UseCreateReviewResult {
  // Контракт hook для UI.
  createReview: (payload: CreateReviewRequest) => Promise<unknown>; // Команда создания отзыва.
  review: Review | null; // Созданный отзыв.
  isCreating: boolean; // Состояние выполнения команды.
  isError: boolean; // Признак ошибки запроса.
  isSuccess: boolean; // Признак успешного создания.
  reset: () => void; // Сброс состояния mutation.
}

export function useCreateReview(): UseCreateReviewResult {
  // Подключение RTK Query mutation.
  const [createReviewMutation, { data, isLoading, isError, isSuccess, reset }] =
    useCreateReviewMutation();

  return {
    createReview: (payload) => createReviewMutation(payload), // Вызов команды создания.
    review: data ?? null, // Данные созданного отзыва.
    isCreating: isLoading, // Статуса загрузки.
    isError, // Ошибка выполнения mutation.
    isSuccess, // Успешное завершение mutation.
    reset, // Очистка текущего состояния.
  };
}
