export { getDefaultRouteForRole, hasRequiredRole } from "./roles";
// requireRole is server-only — import directly from "@/business/auth/utils/serverAuth"
export { loginFormSchema, loginSchema, normalizePhone, registerApiSchema, registerSchema } from "./schemas";
export type { LoginFormValues, RegisterFormValues } from "./schemas";
export { getApiError, getApiErrorMessage, ROUTE_PATHS } from "@/business/shared/utils";

