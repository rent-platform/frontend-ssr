export type AuditKind = "today" | "all" | "user" | "admin";

export type AuditLogDto = {
  id?: string;
  service?: string;
  actorId?: string;
  actorRole?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  metadata?: unknown;
  createdAt?: string;
  [key: string]: unknown;
};

export type AuditPageResponseDto = {
  content?: AuditLogDto[];
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
  size?: number;
  number?: number;
  numberOfElements?: number;
  empty?: boolean;
  [key: string]: unknown;
};

export type FetchAuditLogsArgs = {
  kind: AuditKind;
  userId?: string;
  page?: number;
  size?: number;
};
