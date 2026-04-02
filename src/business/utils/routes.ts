/** Централизованный реестр маршрутов приложения */
export const ROUTE_PATHS = {
  HOME: "/",
  PROFILE: "/profile",
  ORDERS: "/orders",
  CART: "/cart",
  LOGIN: "/login",
  REGISTER: "/register",
  devUi: "/dev-ui",
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];

