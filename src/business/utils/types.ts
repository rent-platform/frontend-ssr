// ─── Utility Types ────────────────────────────────────────────────────────────

/** Делает все поля объекта необязательными рекурсивно */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Делает указанные поля обязательными */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Тип для ID сущностей */
export type ID = string | number;

/** Стандартный ответ API */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

/** Пагинированный ответ API */
export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

/** Статусы загрузки */
export type LoadingStatus = "idle" | "loading" | "success" | "error";

