import AuthLayout from "@/ux/layouts/AuthLayout";
import {PropsWithChildren} from "react";

/** Route group (auth) — общий UI-лэйаут для страниц /login и /register */
export default function AuthGroupLayout({
  children,
}: PropsWithChildren) {
  return <AuthLayout>{children}</AuthLayout>;
}

