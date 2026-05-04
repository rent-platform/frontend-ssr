export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type LoadingStatus = "idle" | "loading" | "success" | "error";

export type ApiUiError = {
  message: string;
  status?: number | string;
  code?: string;
};

