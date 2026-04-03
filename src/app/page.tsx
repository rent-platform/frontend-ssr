import { redirect } from "next/navigation";
import { ROUTE_PATHS } from "@/business/utils/routes/routes";


export default function HomePage() {
  redirect(ROUTE_PATHS.devUi);
}
