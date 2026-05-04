import type { SerializedError } from "@reduxjs/toolkit"; // Тип ошибки, сериализуемой Redux Toolkit.
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"; // Тип ошибки, которую возвращает RTK Query fetchBaseQuery.
import type { ApiUiError } from "../../types/common"; // Единый формат ошибки, передаваемый в UI.

const DEFAULT_ERROR_MESSAGE = "Не удалось выполнить запрос. Попробуйте позже."; // Сообщение по умолчанию, если текст ошибки не найден.

function isRecord(value: unknown): value is Record<string, unknown> {
  // Проверяет, что значение является объектом.
  return typeof value === "object" && value !== null; // Исключает примитивы и null.
}

function getStringField(source: unknown, field: string): string | undefined {
  // Достаёт строковое поле из неизвестного объекта.
  if (!isRecord(source)) return undefined; // Если это не объект, поле получить нельзя.

  const value = source[field]; // Получает значение поля по имени.

  return typeof value === "string" && value.trim() ? value : undefined; // Возвращает только непустую строку.
}

function getErrorMessageFromData(data: unknown): string | undefined {
  // Извлекает сообщение из тела ошибки backend.
  if (typeof data === "string" && data.trim()) {
    // Backend может вернуть ошибку простой строкой.
    return data; // Строка сразу подходит как текст ошибки.
  }

  return (
    // Проверяет распространённые поля с текстом ошибки.
    getStringField(data, "message") ?? // Основной вариант: { message: "..." }.
    getStringField(data, "error") ?? // Частый вариант API: { error: "..." }.
    getStringField(data, "detail") ?? // Вариант детального описания ошибки.
    getStringField(data, "title") // Вариант заголовка ошибки.
  );
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  // Проверяет ошибку RTK Query fetchBaseQuery.
  return isRecord(error) && "status" in error; // У FetchBaseQueryError всегда есть HTTP-статус или строковый статус.
}

function isSerializedError(error: unknown): error is SerializedError {
  // Проверяет сериализованную ошибку Redux Toolkit.
  return (
    // SerializedError может содержать разные поля.
    isRecord(error) && // Ошибка должна быть объектом.
    ("message" in error || // Текст ошибки.
      "name" in error || // Имя ошибки.
      "code" in error || // Код ошибки.
      "stack" in error) // Stack trace ошибки.
  );
}

export function getApiError(error: unknown): ApiUiError | null {
  if (!error) return null; // Если ошибки нет, UI получает null.

  // Обработка ошибки, пришедшей строкой.
  if (typeof error === "string") {
    return {
      message: error.trim() || DEFAULT_ERROR_MESSAGE, // Использует строку или fallback.
    };
  }

  // Обработка стандартной JavaScript-ошибки.
  if (error instanceof Error) {
    return {
      // Возвращает объект ошибки для UI.
      message: error.message || DEFAULT_ERROR_MESSAGE, // Берёт message или fallback.
    };
  }

  // Основной сценарий ошибок RTK Query.
  if (isFetchBaseQueryError(error)) {
    const data = isRecord(error) ? error.data : undefined; // Достаёт тело ответа backend, если оно есть.

    const dataMessage = getErrorMessageFromData(data); // Пытается найти сообщение в data.
    const code = getStringField(data, "code"); // Пытается найти машинный код ошибки.

    const internalErrorMessage = // Текст внутренней ошибки RTK Query, например FETCH_ERROR.
      "error" in error && typeof error.error === "string" // Проверяет наличие строкового поля error.
        ? error.error // Использует внутреннее сообщение RTK Query.
        : undefined; // Если поля нет, оставляет undefined.

    return {
      // Возвращает нормализованную ошибку для UI.
      message:
        dataMessage ?? // В приоритете сообщение backend.
        internalErrorMessage ?? // Затем сообщение RTK Query.
        `Ошибка сервера (${error.status})`, // Затем fallback со статусом.
      status: error.status, // Передаёт HTTP-статус или строковый статус RTK Query.
      code, // Передаёт код ошибки, если backend его вернул.
    };
  }

  if (isSerializedError(error)) {
    // Обработка сериализованной ошибки Redux Toolkit.
    return {
      // Возвращает объект ошибки для UI.
      message: error.message || DEFAULT_ERROR_MESSAGE, // Берёт message или fallback.
      code: error.code, // Передаёт код ошибки, если он есть.
    };
  }

  const message = getErrorMessageFromData(error); // Последняя попытка извлечь сообщение из неизвестного объекта.

  return {
    // Возвращает fallback-ошибку для UI.
    message: message ?? DEFAULT_ERROR_MESSAGE, // Использует найденный текст или сообщение по умолчанию.
  };
}

export function getApiErrorMessage(error: unknown): string {
  // Возвращает только текст ошибки для форм.
  return getApiError(error)?.message ?? DEFAULT_ERROR_MESSAGE; // Берёт message из нормализованной ошибки или fallback.
}



