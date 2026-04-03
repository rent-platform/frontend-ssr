import { redirect } from "next/navigation";
import { ROUTE_PATHS } from "@/business/utils/routes/routes";

/** Главная страница — редиректит на /login.
 *  Когда появится защищённый контент — заменить на реальный Dashboard. */
export default function HomePage() {
  redirect(ROUTE_PATHS.LOGIN);
}
