import AuthLayout from "@/ux/layouts/AuthLayout";
import {PropsWithChildren} from "react";


export default function AuthGroupLayout({
  children,
}: PropsWithChildren) {
  return <AuthLayout>{children}</AuthLayout>;
}

