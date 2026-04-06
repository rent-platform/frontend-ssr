"use client";
import { PropsWithChildren } from "react";
import { SessionProvider } from "next-auth/react";
import StoreProvider from "@/business/store/StoreProvider";

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <SessionProvider>
      <StoreProvider>{children}</StoreProvider>
    </SessionProvider>
  );
};
