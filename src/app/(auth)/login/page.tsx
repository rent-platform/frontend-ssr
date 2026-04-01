import type { Metadata } from "next";
import { LoginForm } from "@/ux/components/LoginForm";

export const metadata: Metadata = { title: "Вход | Rent Platform" };

export default function LoginPage() {
  return <LoginForm />;
}


