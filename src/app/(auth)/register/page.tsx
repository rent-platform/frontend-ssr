import type { Metadata } from "next";
import { RegisterForm } from "@/ux/components/RegisterForm";

export const metadata: Metadata = { title: "Регистрация | Rent Platform" };

export default function RegisterPage() {
  return <RegisterForm />;
}


