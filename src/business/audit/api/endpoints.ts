import { baseApi } from "@/business/shared";
import type { AuditPageResponseDto, FetchAuditLogsArgs } from "../types";

const AUDIT_URL = "api/audit";
const AUDIT_TAG_ID = "LIST";

function buildAuditQuery(args: FetchAuditLogsArgs) {
  const params = {
    page: args.page ?? 0,
    size: args.size ?? 30,
  };

  if (args.kind === "user") {
    return {
      url: `${AUDIT_URL}/user/${encodeURIComponent(args.userId ?? "")}`,
      params,
    };
  }

  if (args.kind === "admin") {
    return { url: `${AUDIT_URL}/admin`, params };
  }

  if (args.kind === "all") {
    return { url: AUDIT_URL, params };
  }

  return { url: `${AUDIT_URL}/today`, params };
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    fetchAuditLogs: build.query<AuditPageResponseDto, FetchAuditLogsArgs>({
      query: buildAuditQuery,
      providesTags: [{ type: "Audit", id: AUDIT_TAG_ID }],
    }),
  }),
});

export const { useFetchAuditLogsQuery, useLazyFetchAuditLogsQuery } = auditApi;
