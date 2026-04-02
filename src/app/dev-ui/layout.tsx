import AuthLayout from "@/ux/layouts/AuthLayout";
import {PropsWithChildren} from "react";


export default function AuthGroupLayout({children,}: PropsWithChildren<unknown>) {
    return <AuthLayout>{children}</AuthLayout>;
}

